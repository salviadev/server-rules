"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../core/utils");
const schema = require("./schema");
const modelHelper = require("./helper");
class BaseModel {
    getFullPath() {
        let that = this;
        if (!that._cachePath === undefined) {
            let segments = [];
            if (that._owner)
                segments.push(that._owner.getFullPath());
            segments.push(that._propertyName || '');
            that._cachePath = segments.join('');
        }
        return that._cachePath;
    }
    isArray() { return schema.isArrayOfObjects(this._schema); }
    get owner() {
        return this._owner;
    }
    addErrors(alerts, add) {
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
        that._owner = owner;
        that._propertyName = propertyName;
        that._schema = schema;
        that._children = {};
        that._initialized = {};
        //that._initFromSchema(schema);        
        /*
        //create properties
        that._createProperties();
        //create errors
        that._createErrors();
        //create states
        that._createStates();
        */
    }
    destroy() {
        let that = this;
        if (that._children) {
            modelHelper.destroyObject(that._children);
            that._children = null;
        }
        that._schema = null;
        that._model = null;
        that._owner = null;
        that._initialized = null;
    }
    _beforeChange(propertyName, schema, oldValue, value, forceContinue) {
        let that = this;
        let res = { continue: true, value: value };
        if (_su.isNumber(schema) && !isNaN(value) && value !== null && value !== undefined) {
            if (that.$states[propertyName] && that.$states[propertyName].decimals !== undefined) {
                res.value = parseFloat(value.toFixed(that.$states[propertyName].decimals));
                if (!forceContinue && oldValue === res.value)
                    res.continue = false;
            }
        }
        return res;
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
                let old = that._model[propertyName];
                if (old !== value || !that._initialized[propertyName]) {
                    if (that._beforeChange(propertyName, old, value)) {
                        that._model[propertyName] = value;
                        let schema = that._schema.properties[propertyName];
                        if (schemaUtils.isObject(schema)) {
                            that._setRefChild(propertyName, old, value, {});
                            that._notifyChanged(propertyName, old, value, "propchange", {}, true);
                            that.notifyMetaDataChanged(propertyName, {});
                        }
                        else if (schemaUtils.isArrayOfObjects(schema)) {
                            that._setListChild(propertyName, old, value, "propchange", {});
                            that._notifyChanged(propertyName, old, value, "propchange", {}, true);
                            that.notifyMetaDataChanged(propertyName, {});
                        }
                        else {
                            that._notifyChanged(propertyName, old, value, "propchange", {}, true);
                        }
                    }
                }
            },
            enumerable: true
        });
    }
    _initFromSchema() {
        let that = this;
        if (!that._model)
            return;
        let states = (that._schema.states ? utils.extend(null, that._schema.states, true) : null), links = (that._schema.links ? utils.extend(null, that._schema.links, true) : null), errors = (that._schema.errors ? utils.extend(null, that._schema.errors, true) : null);
        schema.enumProperties(that._schema, function (propertyName, item, isObject, isArray) {
            _createProp(that, propertyName);
            _createStateProp(that, propertyName, states ? states[propertyName] : null);
            _createErrorProp(that, propertyName, errors ? errors[propertyName] : null);
        });
        if (that._schema.links) {
            Object.keys(schema.links).forEach((name) => { _createStateLinks(that, name, links ? links[name] : null); });
        }
        // root error
        if (!that._owner) {
            that.$errors.$ = new _observable.Errors(that, '$', [], false);
        }
    }
}
exports.BaseModel = BaseModel;
/*
        export class Model extends BaseModel {
            private _addMeta: boolean;
            private _actions: any;
            private _meta: any;
            private _model: any;
            private _associations: any;
            private _objectMeta: MetaProperty;
            private _schema: any;
            public IsObject: boolean = true;

            constructor(owner: any, propertyName: string, schema: any, value) {
                let that = this;
                that._owner = owner;
                that._propertyName = propertyName;
                that._schema = schema;
                // take the object state from parent
                that._metaInParent = that._owner && that._owner.isObject;

                if (that._metaInParent) {
                    that._objectMeta = that._owner.$[propertyName];
                } else {
                    //	that._objectMeta = new value = that._checkValue(value)
 
                }
            }
            private _checkValue(value: any): any {
                let that = this;
                that.isNull = value === null;
                that.isUndefined = value === undefined;
                value = value || {};
                value.$ = value.$ || {};
                return value;
            }

            destroy() {
                let that = this;
                if (!that._metaInParent) {
                    if (that._objectMeta) {
                        that._objectMeta.destroy();
                    }
                }
                that._objectMeta = null;
                that._owner = null;

            }
            public get $(): any {
                return this._meta;
            }
            public get $actions(): any {
                return this._actions;
            }

            private _freeze(cb: () => void) {
                let that = this;
                let ofv = that.frozen;
                that.frozen = true;
                try {
                    cb();
                } finally {
                    that.frozen = ofv;
                }
            }
            private _initFromSchema(schema) {
                let that = this;
                if (!that._model) return;
                let states = (schema.states ? _utils.extend(null, schema.states) : null),
                    links = (schema.links ? $.extend(true, {}, schema.links) : null),
                    errors = (schema.errors ? $.extend(true, {}, schema.errors) : null);
                _schema.enumProperties(that._schema, function(propertyName, item, isObject, isArray) {
                    _createProp(that, propertyName);
                    _createStateProp(that, propertyName, states ? states[propertyName] : null);
                    _createErrorProp(that, propertyName, errors ? errors[propertyName] : null);
                });
                if (schema.links) {
                    Object.keys(schema.links).forEach((name) => { _createStateLinks(that, name, links ? links[name] : null); });
                }
                // root error
                if (!that._owner) {
                    that.$errors.$ = new _observable.Errors(that, '$', [], false);
                }
            }

            private _init(value: any) {
                let that = this;
                that.isNullOrUndefined = value === null || value === undefined;
                value = value || {};
                value.$ = value.$ || {};

                if (that._addMeta) {
                    if (that.isNullOrUndefined)
                        if (that._meta) that._meta.destroy();
                    that._meta = new MetaProperty(that, that._propertyName, value.$);
                }
                _schema.enumProperties(that._schema, function(propertyName, item, isObject, isArray) {
                    let val = value[propertyName];
                    if (isArray && !val) {
                        val = [];
                        value[propertyName] = val;
                    }
                    if (isObject) {

                    } else if (isArray) {

                    }

                });
                that._model = value;

            }
            /*
                        _setModel(value, frozen) {
                            let that = this;
                            let ofv = that.frozen;
                            if (frozen) that.frozen = true;
                            that.isNull = value === null;
                            that.isUndefined = value === undefined;
                            value = value || {};
                            value.$states = value.$states || {};
                            value.$links = value.$links || {};
                            value.$errors = value.$errors || {};
                            let props = Object.keys(that._schema.properties);
                            
                            //for each property set value && state
                            props.forEach(function(name) {
                                let si = that._schema.properties[name];
                                if (!_su.inModel(si)) return;
                                let val = value[name];
                                if (!val && _su.isCompositionList(si)) {
                                    val = [];
                                    value[name] = val
                                }
                                that[name] = val;
                                if (value.$states && value.$states[name]) {
                                    let ss = value.$states[name];
                                    Object.keys(ss).forEach((sn) => { that.$states[name][sn] = ss[sn]; });
                                }
                                value.$states[name] = that.$states[name].state();
            
                                if (value.$errors && value.$errors[name]) {
                                    let errors = value.$errors[name];
                                    let ne = [];
                                    errors.forEach((err) => { ne.push(err) });
                                    that.$errors[name].addErrors(ne);
                                }
                                value.$errors[name] = that.$errors[name].errors();
            
                            });
                            //for each link set state
                            if (that._model.$links) {
                                props = Object.keys(that._schema.links || {})
                                props.forEach(function(name) {
                                    let ss = that._model.$links[name];
                                    if (ss) {
                                        Object.keys(ss).forEach((sn) => { that.$links[sn] = ss[sn]; });
                                    }
                                    value.$links[name] = that.$links[name].state();
                                });
                            }
                            that._model = value;
                            that.frozen = ofv;
                        } */
// }
/*
OB

*/ 
