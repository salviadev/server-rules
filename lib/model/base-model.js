"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../core/utils");
const schemaUtils = require("./schema");
const modelHelper = require("./helper");
class BaseModel {
    //states
    get $states() {
        return this._states;
    }
    //states
    get $schema() {
        return this._schema;
    }
    getRoot() {
        let that = this;
        if (!that._cacheRoot) {
            if (that._owner)
                that._cacheRoot = that._owner.getRoot();
            else
                that._cacheRoot = that;
        }
        return that._cacheRoot;
    }
    _getPropertyPath(propertyName) {
        let that = this;
        let fp = that.getFullPath();
        if (!propertyName)
            return fp;
        return fp ? (fp + '.' + propertyName) : propertyName;
    }
    setModel(value, notify) {
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
    afterSetModel(notify) {
        let that = this;
        if (that._model.$states)
            that._states = that._model.$states;
    }
    replaceCompositionObject(propertyName, value) {
    }
    getFullPath() {
        let that = this;
        if (that._cachePath === undefined) {
            let segments = [];
            if (that._owner)
                segments.push(that._owner.getFullPath());
            segments.push(that._propertyName || '');
            that._cachePath = segments.join('');
        }
        return that._cachePath;
    }
    _createProperties() {
    }
    isArray() {
        let that = this;
        return schemaUtils.isArrayOfObjects(that._schema, that.getRoot().$schema);
    }
    get owner() {
        return this._owner;
    }
    addErrors(alerts, add) {
    }
    firePropChangedChanged(operation, propertyName, oldvalue, newValue, params) {
    }
    model() {
        return this._model;
    }
    fireMetaDataChanged(propertyName, params) {
        let that = this, parent = that.owner;
        if (that._frozen)
            return;
        if (parent) {
            let pn = that._propertyName + (propertyName ? ('.' + propertyName) : '');
            if (parent.isArray()) {
                params = params || {};
                params[that.getFullPath()] = that.uuid;
            }
            that.owner.fireMetaDataChanged(pn, params);
        }
        else {
            if (that.onStateChange)
                that.onStateChange(propertyName, params);
        }
    }
    constructor(owner, propertyName, schema, value) {
        let that = this;
        that.uuid = utils.uuid();
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
    destroy() {
        let that = this;
        if (that._children) {
            modelHelper.destroyObject(that._children);
            that._children = null;
        }
        if (that._states) {
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
exports.BaseModel = BaseModel;
