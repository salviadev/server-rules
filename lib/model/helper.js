"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemaUtils = require("./schema");
exports.createModelProperty = _createProperty;
exports.destroyObject = _destroyObject;
var _createProperty = (obj, propertyName) => {
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
}, _destroyObject = (obj) => {
    if (obj) {
        Object.keys(obj).forEach((ii) => {
            ii.destroy();
        });
    }
    ;
};
