import * as schemaUtils from './schema';


export const createModelProperty = _createProperty;
export const destroyObject = _destroyObject;


var
    _createProperty = (obj: any, propertyName: string): void => {
        Object.defineProperty(obj, propertyName, {
            get: function (): any {
                let that = this;
                let ref = that._children[propertyName];
                if (ref)
                    return ref;
                return that._model[propertyName];
            },
            set: function (value: any): void {
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
                        } else if (schemaUtils.isArrayOfObjects(schema)) {
                            that._setListChild(propertyName, old, value, "propchange", {});
                            that._notifyChanged(propertyName, old, value, "propchange", {}, true);
                            that.notifyMetaDataChanged(propertyName, {});
                        } else {
                            that._notifyChanged(propertyName, old, value, "propchange", {}, true);
                        }

                    }
                }
            },
            enumerable: true
        });
    },

    _destroyObject = (obj: any): void => {
        if (obj) {
            Object.keys(obj).forEach((ii: any) => {
                ii.destroy();
            });
        };
    };





