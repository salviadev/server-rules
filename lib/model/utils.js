"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemaUtils = require("./schema");
var _createProperty = function (obj, propertyName) {
    Object.defineProperty(obj, propertyName, {
        get: function () {
            let that = this;
            let ref = that._associations[propertyName];
            if (ref) {
                // is an association
                if (ref.isUndefined)
                    return undefined;
                if (ref.isNull)
                    return null;
                //return model object	
                return ref;
            }
            else
                return that._model[propertyName];
        },
        set: function (value) {
            let that = this;
            let old = that._model[propertyName];
            if (old !== value) {
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
};
exports.createModelProperty = _createProperty;
