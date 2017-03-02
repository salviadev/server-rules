import * as utils from '../core/utils';
import * as schema from './schema';
import * as modelHelper from './helper';
import { Message } from './consts';
import { ModelObject } from './interfaces';

export class BaseModel implements ModelObject {

    private _cachePath: string;
    private _cacheRoot: BaseModel;

    protected _initialized: any;
    // no notifications
    protected _frozen: boolean;
    //is null ?
    public isNull: boolean;
    // is undefined ?
    public isUndefined: boolean;
    // universal  uid
    public uuid: string;
    // if frozen not fire events
    protected _frozen: boolean;
    // parent
    protected _owner: any;
    // schema
    protected _schema: any;
    // model
    protected _model: any;
    //children
    protected _children: any;
    //states
    protected _states: any;
    //errors
    protected _errors: any;

    //states
    public get $states() {
        return this._states;
    }
    //states
    public get $schema() {
        return this._schema;

    }
    // is empty only for the root owner
    // for items of an array (one-to-many) _propertyName === '$item' 
    protected _propertyName: string;

    protected getRoot(): BaseModel {
        let that = this;
        if (!that._cacheRoot) {
            if (that._owner)
                that._cacheRoot = that._owner.getRoot();
            else
                that._cacheRoot = that;

        }
        return that._cacheRoot;
    }
    protected _getPropertyPath(propertyName?: string) {
        let that = this;
        let fp = that.getFullPath();
        if (!propertyName) return fp;
        return fp ? (fp + '.' + propertyName) : propertyName;
    }
    protected setModel(value: any, notify: boolean): void {
        let that = this;
        that._model = value;
        that.isUndefined = value === undefined;
        that.isNull = value === null;
        if (that._owner && !that._owner.isArray()) {
            let om = that._owner.model();
            om[that._propertyName] = value;
        }
        that.afterSetModel(notify);
    }
    protected afterSetModel(notify: boolean): void {
    }
    protected replaceCompositionObject(propertyName: string, value: any): void {
    }

    protected getFullPath(): string {
        let that = this;
        if (that._cachePath === undefined) {
            let segments: string[] = [];
            if (that._owner)
                segments.push(that._owner.getFullPath())
            segments.push(that._propertyName || '');
            that._cachePath = segments.join('');

        }
        return that._cachePath;
    }
    protected _createProperties() {

    }

    public isArray(): boolean {
        let that = this;
        return schema.isArrayOfObjects(that._schema, that.getRoot()._schema);
    }

    public get owner(): ModelObject {
        return <ModelObject>this._owner;
    }
    public addErrors(alerts: { message: string, severity?: number }[], add?: boolean): void {
    }


    public firePropChangedChanged(operation: number, propertyName: string, oldvalue: any, newValue: any, params: any): void {
    }
    public fireMetaDataChanged(propertyName: string, params: any): void {
        let that = this, parent = that.owner;
        if (that._frozen) return;
        if (parent) {
            let pn = that._propertyName + (propertyName ? ('.' + propertyName) : '');
            if (parent.isArray()) {
                params = params || {};
                params[that.getFullPath()] = that.uuid;
            }
            that.owner.fireMetaDataChanged(pn, params);
        } else {
            if (that.onStateChange)
                that.onStateChange(propertyName, params);
        }
    }
    public onStateChange: (propertyName: string, params: any) => void;
    public onChange: (propertyName: string, operation: string, params: any) => void;

    constructor(owner: any, propertyName: string, schema: any, value: any) {
        let that = this;
        that.uuid = utils.uuid()
        that._owner = owner;
        that._propertyName = propertyName;
        that._schema = schema;
        that._children = {};
        that._initialized = {};
        that._states = {};
        that._errors = {};
        that._frozen = true;
        that.setModel(value, false);
        that._frozen = false;
    }
    public destroy() {
        let that = this;
        if (that._children) {
            modelHelper.destroyObject(that._children);
            that._children = null;
        }
        if (that._states) {
            modelHelper.destroyObject(that._states);
            that._states = null;
        }
        if (that._errors) {
            modelHelper.destroyObject(that._errors);
            that._errors = null;
        }
        that._schema = null;
        that._model = null;
        that._owner = null;
        that._initialized = null;
    }


}
