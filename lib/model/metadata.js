"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
class BaseMeta {
    constructor(owner, propName, value) {
        var that = this;
        that._owner = owner;
        that._propName = propName;
        that._meta = value || { isHidden: false, isDisabled: false };
        that.init();
    }
    destroy() {
        var that = this;
        that._meta = null;
        that._owner = null;
    }
    init() {
        let that = this;
        that._meta.isHidden = that._meta.isHidden || false;
        that._meta.isDisabled = that._meta.isDisabled || false;
    }
    notify(propertyName) {
        let that = this;
        if (that._owner)
            that._owner.fireMetaDataChanged(that._propName + '.' + propertyName, {});
    }
    meta() {
        return this._meta;
    }
    get isHidden() {
        return _checkBool(this._meta.isHidden);
    }
    set isHidden(value) {
        let that = this;
        if (_checkBool(that._meta.isHidden) !== value) {
            that._meta.isHidden = value;
            that.notify('isHidden');
        }
    }
    get isDisabled() {
        return _checkBool(this._meta.isDisabled);
    }
    set isDisabled(value) {
        let that = this;
        if (_checkBool(that._meta.isDisabled) !== value) {
            that._meta.isDisabled == value;
            that.notify('isDisabled');
        }
    }
}
exports.BaseMeta = BaseMeta;
;
class MetaLink extends BaseMeta {
    constructor(owner, propName, value) {
        super(owner, propName, value);
    }
}
exports.MetaLink = MetaLink;
class MetaObject extends BaseMeta {
    constructor(owner, propName, value) {
        super(owner, propName, value);
        let that = this;
        that._$errors = new errors_1.Errors(owner, propName, that._meta.$errors);
    }
    init() {
        super.init();
        let that = this;
        that._meta.$errors = that._meta.$errors || [];
    }
    destroy() {
        var that = this;
        if (that._$errors) {
            that._$errors.destroy();
            that._$errors = null;
        }
        super.destroy();
    }
    get $errors() {
        return this._$errors;
    }
}
exports.MetaObject = MetaObject;
class MetaProperty extends MetaObject {
    constructor(owner, propName, value) {
        super(owner, propName, value);
    }
    init() {
        super.init();
        let that = this;
        that._meta.isMandatory = that._meta.isMandatory || false;
        that._meta.isReadOnly = that._meta.isReadOnly || false;
    }
    get isMandatory() {
        return _checkBool(this._meta.isMandatory);
    }
    set isMandatory(value) {
        let that = this;
        if (_checkBool(that._meta.isMandatory) !== value) {
            that._meta.isMandatory = value;
            that.notify('isMandatory');
        }
    }
    get isReadOnly() {
        return _checkBool(this._meta.isReadOnly);
    }
    set isReadOnly(value) {
        let that = this;
        if (_checkBool(that._meta.isReadOnly) !== value) {
            that._meta.isReadOnly = value;
            that.notify('isReadOnly');
        }
    }
}
exports.MetaProperty = MetaProperty;
function _checkBool(value) {
    if (value === undefined)
        return false;
    return value;
}
