"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../core/utils");
const schema = require("./schema");
const modelHelper = require("./helper");
const consts_1 = require("./consts");
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
        return schema.isArrayOfObjects(that._schema, that.getRoot()._schema);
    }
    get owner() {
        return this._owner;
    }
    addErrors(alerts, add) {
    }
    firePropChangedChanged(operation, propertyName, oldvalue, newValue, params) {
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
        that.setModel(value, false);
    }
    destroy() {
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
exports.BaseModel = BaseModel;
class ArrayModel extends BaseModel {
    constructor(owner, propertyName, schema, value) {
        super(owner, propertyName, schema, value);
    }
    clearItems() {
        let that = this;
        if (that._items) {
            that._items.forEach(item => item.destroy());
            that._items = null;
        }
    }
    destroy() {
        let that = this;
        if (that._items) {
            that._items.forEach(item => item.destroy());
            that._items = null;
        }
        super.destroy();
    }
    afterSetModel(notify) {
        let that = this;
        that._model = that._model || [];
        that._items = that._items || [];
        that.clearItems();
        // create items
        let root = that.getRoot();
        that._model.forEach((modelItem) => {
            that._items.push(new ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem));
        });
        if (notify)
            that.firePropChangedChanged(consts_1.Message.PropChanged, '', null, null, { source: that._getPropertyPath(), instance: that });
    }
    push(modelItem) {
        let that = this;
        let root = that.getRoot();
        let item = new ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem);
        that._model.push(modelItem);
        that._items.push(item);
        that.firePropChangedChanged(consts_1.Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        return item;
    }
    pop() {
        let that = this;
        let root = that.getRoot();
        that._model.pop();
        let item = that._items.pop();
        that.firePropChangedChanged(consts_1.Message.RemoveItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        item.destroy();
    }
    insert(index, modelItem) {
        let that = this;
        let root = that.getRoot();
        let item = new ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem);
        if (index >= 0 && index < (that._model.length - 1)) {
            that._model.splice(index, 0, modelItem);
            that._items.splice(index, 0, item);
        }
        else {
            that._model.push(modelItem);
            that._items.push(item);
        }
        that._items.push(item);
        that.firePropChangedChanged(consts_1.Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        return item;
    }
}
exports.ArrayModel = ArrayModel;
class ObjectModel extends BaseModel {
    _beforeChange(propertyName, schema, oldValue, value, forceContinue) {
        let that = this;
        let res = { continue: true, value: value };
        if (schema.isNumber(schema) && !isNaN(value) && value !== null && value !== undefined) {
            if (that.$states[propertyName] && that.$states[propertyName].decimals !== undefined) {
                res.value = parseFloat(value.toFixed(that.$states[propertyName].decimals));
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
    _createProperty(propertyName) {
        let obj = this;
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
                        if (schema.isObject(cschema, rootSchema)) {
                            that.replaceCompositionObject(propertyName, value);
                            that.firePropChangedChanged(consts_1.Message.PropChanged, propertyName, oldValue, value, { source: that._getPropertyPath(propertyName), instance: that });
                        }
                        else if (schema.isArrayOfObjects(cschema, rootSchema)) {
                            let child = that._children[propertyName];
                            if (child)
                                child.setModel(value, true);
                        }
                        else
                            that.firePropChangedChanged(consts_1.Message.PropChanged, propertyName, oldValue, value, { source: that._getPropertyPath(propertyName), instance: that });
                    }
                }
            },
            enumerable: true
        });
    }
    afterSetModel(notify) {
        let that = this;
        let rootSchema = that.getRoot().$schema;
        if (that._model && that._model.$create) {
            schema.initFromSchema(that.$schema, rootSchema, that._model);
            delete that._model.$create;
        }
        schema.enumProperties(that._schema, rootSchema, function (propertyName, cschema, isObject, isArray) {
            that._createProperty(propertyName);
            if (schema.isObject(cschema, rootSchema)) {
                if (that._model[propertyName])
                    that._children[propertyName] = new ObjectModel(that, propertyName, cschema, that._model[propertyName]);
            }
            else if (schema.isArrayOfObjects(cschema, rootSchema)) {
                that._children[propertyName] = new ArrayModel(that, propertyName, cschema, that._model[propertyName]);
            }
        });
    }
    constructor(owner, propertyName, schema, value) {
        super(owner, propertyName, schema, value);
    }
    destroy() {
        super.destroy();
    }
}
exports.ObjectModel = ObjectModel;
