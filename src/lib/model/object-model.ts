import * as utils from '../core/utils';
import * as schemaUtils from './schema';
import { Message } from './consts';
import { Errors } from './errors';
import { ModelObject } from './interfaces';
import { BaseModel } from './base-model';
import { ArrayModel } from './array-model';



export class ObjectModel extends BaseModel {
    private _className: string;
    private _beforeChange(propertyName: string, schema: any, oldValue: any, value: any, forceContinue: boolean): { continue: boolean, value: any } {
        let that = this;
        let res = { continue: true, value: value }
        if (schemaUtils.isNumber(schema) && !isNaN(value) && value !== null && value !== undefined) {
            if (that.$states[propertyName] && that.$states[propertyName].decimals !== undefined) {
                res.value = parseFloat(value.toFixed(that.$states[propertyName].decimals));
                if (!forceContinue && oldValue === res.value)
                    res.continue = false;
            }
        }
        return res;
    }

    protected replaceCompositionObject(propertyName: string, value: any): void {
        let that = this;
        if (that._children[propertyName]) {
            that._children[propertyName].destroy();
            if (!value) delete that._children[propertyName];
        }
        that._model[propertyName] = value;
        if (value)
            that._children[propertyName] = new ObjectModel(that, propertyName, that._schema.properties[propertyName], value);
    }
    private _createErrorProperty(propertyName: string) {
        let that = this;
        that._errors[propertyName] = new Errors(that, propertyName, null);
    }
    private _createProperty(propertyName: string): void {
        let obj = this;
        let cs = obj._schema.properties[propertyName];
        if (cs.type !== schemaUtils.JSONTYPES.object)
            obj._createErrorProperty(propertyName);
        Object.defineProperty(obj, propertyName, {
            get: function (): any {
                let that: ObjectModel = this;
                let ref = that._children[propertyName];
                if (ref)
                    return ref;
                return that._model[propertyName];
            },
            set: function (value: any): void {
                let that: ObjectModel = this;
                let oldValue = that._model[propertyName];
                if (oldValue !== value || !that._initialized[propertyName]) {
                    const cschema = that._schema.properties[propertyName];
                    let bcRes = that._beforeChange(propertyName, cschema, oldValue, value, !that._initialized[propertyName]);
                    value = bcRes.value;
                    that._initialized[propertyName] = true;
                    if (bcRes.continue) {
                        that._model[propertyName] = value;
                        let rootSchema = obj.getRoot().$schema;
                        if (schemaUtils.isObject(cschema, rootSchema)) {
                            that.replaceCompositionObject(propertyName, value);
                            that.firePropChangedChanged(Message.PropChanged, propertyName, oldValue, value, { source: that._getPropertyPath(propertyName), instance: that });
                        } else if (schemaUtils.isArrayOfObjects(cschema, rootSchema)) {
                            let child = that._children[propertyName];
                            if (child)
                                child.setModel(value, true);
                        } else
                            that.firePropChangedChanged(Message.PropChanged, propertyName, oldValue, value, { source: that._getPropertyPath(propertyName), instance: that });

                    }
                }
            },
            enumerable: true
        });
    }

    protected afterSetModel(notify: boolean): void {
        let that = this;
        let rootSchema = that.getRoot().$schema;
        if (that._model) {
            schemaUtils.initFromSchema(that._schema, rootSchema, that._model, that._model.$create);
        }
        delete that._model.$create;

        schemaUtils.enumProperties(that._schema, rootSchema, function (propertyName: string, cschema: any, isObject: boolean, isArray: boolean) {
            that._createProperty(propertyName);
            if (schemaUtils.isObject(cschema, rootSchema)) {
                if (that._model[propertyName])
                    that._children[propertyName] = new ObjectModel(that, propertyName, cschema, that._model[propertyName]);
            } else if (schemaUtils.isArrayOfObjects(cschema, rootSchema)) {
                that._children[propertyName] = new ArrayModel(that, propertyName, cschema, that._model[propertyName]);
            }
        });
        if (that._model.$states)
            that._states = that._model.$states;
        if (!that._owner || (that._owner && that._owner.isArray()))
            that._createErrorProperty('$');
    }

    constructor(owner: any, propertyName: string, schema: any, value: any) {
        super(owner, propertyName, schema, value);
        let that = this;
        that._className = schema.name;
    }
    public destroy() {
        super.destroy();
    }
    public addError(message: string): void {
        let that = this;
        if (that.$errors.$) 
            that.$errors.$.addError(message);
        else if (that._owner) 
            that._owner.addError(message);
    }
    public rmvError(message: string): void {
        let that = this;
        that._owner.$errors[that._propertyName].rmvError(message);
    }
    public clearErrors(): void {
        let that = this;
        Object.keys(that.$errors).forEach(pn => {
            let ei = that.$errors[pn];
            ei.clearErrors();
        });
        Object.keys(that._children).forEach(pn => {
            let child = that._children[pn];
            child.clearErrors();
        });
    }


}


