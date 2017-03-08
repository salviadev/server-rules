"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../core/utils");
const schemaUtils = require("./schema");
const consts_1 = require("./consts");
const errors_1 = require("./errors");
const base_model_1 = require("./base-model");
const array_model_1 = require("./array-model");
const rules_1 = require("./rules");
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
                        if (that._isRecursiveRule(propertyName))
                            return;
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
    _isRecursiveRule(propertyName) {
        let that = this;
        let root = that.getRoot();
        if (!root._stack)
            return;
        let path = that._getPropertyPath(propertyName);
        if (root._stack.indexOf(path) >= 0) {
            utils.logRule(root._stack.length, 'Recursive rule detected: property: ' + path, path);
            return true;
        }
        return false;
    }
    _schemaValidate(operation, propertyName) {
        let that = this;
        let res = true;
        let errors = that.$errors[propertyName];
        if (errors) {
            let schema = that._schema.properties[propertyName];
            if (schema) {
                let state = that._states[propertyName];
                if (state) {
                    let obj = that;
                    let rootModel = that.getRoot();
                    let rootSchema = rootModel.$schema;
                    res = schemaUtils.validateProperty(obj[propertyName], schema, rootSchema, state, errors);
                }
            }
        }
        return res;
    }
    _execRulesOnPropChange(operation, propertyName, params) {
        let that = this;
        if (that._owner)
            return;
        if (!that._schema.rules)
            return;
        that._stack = that._stack || [];
        that._stack.push(propertyName);
        try {
            rules_1.execRules(operation, propertyName, that, params);
        }
        finally {
            that._stack.pop();
            if (!that._stack.length)
                return;
        }
    }
    afterSetModel(notify) {
        let that = this;
        let rootModel = that.getRoot();
        let rootSchema = rootModel.$schema;
        if (that._model) {
            that._model.$create = that._model.$create || (that._owner && that._owner.$create);
            schemaUtils.initFromSchema(that._schema, rootSchema, that._model, that._model.$create);
            that._create = that._model.$create;
            delete that._model.$create;
        }
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
        let oldFrozen = that._frozen;
        that._frozen = true;
        try {
            rules_1.execInitRules(that);
        }
        finally {
            that._frozen = oldFrozen;
        }
    }
    constructor(owner, propertyName, schema, value) {
        super(owner, propertyName, schema, value);
    }
    stack() {
        return this._stack;
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
        if (that.$errors.$)
            that.$errors.$.rmvError(message);
        else if (that._owner)
            that._owner.rmvError(message);
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
    validate() {
        let that = this;
        let res = super.validate();
        // execute rules before saving
        rules_1.execBeforeSaveRules(that);
        Object.keys(that._children).forEach(pn => {
            let child = that._children[pn];
            if (!child.validate())
                res = false;
        });
        // validate own properties
        Object.keys(that._schema.properties).forEach(propertyName => {
            if (!that._schemaValidate(consts_1.Message.PropChanged, propertyName))
                res = false;
        });
        //call validation rules
        if (!rules_1.execValidationRules(that))
            res = false;
        return res;
    }
    _clearErrorsForProperty(propertyName) {
        let that = this;
        if (that.$errors && that.$errors[propertyName]) {
            that.$errors[propertyName].clearErrors();
        }
    }
}
exports.ObjectModel = ObjectModel;
