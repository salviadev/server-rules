"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemaUtils = require("./schema");
const consts_1 = require("./consts");
const errors_1 = require("./errors");
const base_model_1 = require("./base-model");
const array_model_1 = require("./array-model");
class ObjectModel extends base_model_1.BaseModel {
    _beforeChange(propertyName, schema, oldValue, value, forceContinue) {
        let that = this;
        let res = { continue: true, value: value };
        if (schemaUtils.isNumber(schema) && !isNaN(value) && value !== null && value !== undefined) {
            if (that._states[propertyName] && that._states[propertyName].decimals !== undefined) {
                res.value = parseFloat(value.toFixed(that._states[propertyName].decimals));
                if (!forceContinue && oldValue === res.value)
                    res.continue = false;
            }
        }
        return res;
    }
    replaceCompositionObject(propertyName, value) {
        let that = this;
        if (that._children[propertyName]) {
            that._children[propertyName].destroy();
            if (!value)
                delete that._children[propertyName];
        }
        that._model[propertyName] = value;
        if (value)
            that._children[propertyName] = new ObjectModel(that, propertyName, that._schema.properties[propertyName], value);
    }
    _createErrorProperty(propertyName) {
        let that = this;
        that._errors[propertyName] = new errors_1.Errors(that, propertyName, null);
    }
    _createProperty(propertyName) {
        let obj = this;
        let cs = obj._schema.properties[propertyName];
        if (cs.type !== schemaUtils.JSONTYPES.object)
            obj._createErrorProperty(propertyName);
        Object.defineProperty(obj, propertyName, {
            get: function () {
                let that = this;
                let ref = that._children[propertyName];
                if (ref)
                    return ref;
                return that._model[propertyName];
            },
            set: function (value) {
                let that = this;
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
                            that.firePropChangedChanged(consts_1.Message.PropChanged, propertyName, oldValue, value, { source: that._getPropertyPath(propertyName), instance: that }, true);
                        }
                        else if (schemaUtils.isArrayOfObjects(cschema, rootSchema)) {
                            let child = that._children[propertyName];
                            if (child)
                                child.setModel(value, true);
                        }
                        else
                            that.firePropChangedChanged(consts_1.Message.PropChanged, propertyName, oldValue, value, { source: that._getPropertyPath(propertyName), instance: that }, true);
                    }
                }
            },
            enumerable: true
        });
    }
    _schemaValidate(operation, propertyName) {
        let that = this;
        let errors = that.$errors[propertyName];
        if (errors) {
            let schema = that._schema.properties[propertyName];
            if (schema) {
                let state = that._states[propertyName];
                if (state) {
                    let obj = that;
                    schemaUtils.validateProperty(obj[propertyName], schema, state, errors);
                }
            }
        }
    }
    afterSetModel(notify) {
        let that = this;
        let rootSchema = that.getRoot().$schema;
        if (that._model) {
            schemaUtils.initFromSchema(that._schema, rootSchema, that._model, that._model.$create);
        }
        delete that._model.$create;
        schemaUtils.enumProperties(that._schema, rootSchema, function (propertyName, cschema, isObject, isArray) {
            that._createProperty(propertyName);
            if (schemaUtils.isObject(cschema, rootSchema)) {
                if (that._model[propertyName])
                    that._children[propertyName] = new ObjectModel(that, propertyName, cschema, that._model[propertyName]);
            }
            else if (schemaUtils.isArrayOfObjects(cschema, rootSchema)) {
                that._children[propertyName] = new array_model_1.ArrayModel(that, propertyName, cschema, that._model[propertyName]);
            }
        });
        if (that._model.$states)
            that._states = that._model.$states;
        if (!that._owner || (that._owner && that._owner.isArray()))
            that._createErrorProperty('$');
    }
    constructor(owner, propertyName, schema, value) {
        super(owner, propertyName, schema, value);
        let that = this;
        that._className = schema.name;
    }
    destroy() {
        super.destroy();
    }
    addError(message) {
        let that = this;
        if (that.$errors.$)
            that.$errors.$.addError(message);
        else if (that._owner)
            that._owner.addError(message);
    }
    rmvError(message) {
        let that = this;
        that._owner.$errors[that._propertyName].rmvError(message);
    }
    clearErrors() {
        let that = this;
        if (that.$errors) {
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
    _clearErrorsForProperty(propertyName) {
        let that = this;
        if (that.$errors && that.$errors[propertyName]) {
            that.$errors[propertyName].clearErrors();
        }
    }
}
exports.ObjectModel = ObjectModel;
