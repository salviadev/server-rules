"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _isRefObject = function (prop) {
    return prop.type === 'ref/object';
}, _isRefArray = function (prop) {
    return prop.type === 'ref/array';
}, _ignore = function (prop) {
    return ['ref/array', 'ref/object'].indexOf(prop.type) >= 0;
}, _isObject = function (prop) {
    return prop.type === 'object';
}, _isArray = function (prop) {
    return prop.type === 'array';
}, _isArrayOfObjects = function (prop) {
    return prop.type === 'array' && prop.items.type === 'object';
}, _enumProps = function (schema, cb) {
    Object.keys(schema.properties).forEach(function (propName) {
        let item = schema.properties[propName];
        if (_ignore(item))
            return;
        cb(propName, item, _isObject(item), _isArray(item));
    });
};
exports.enumProperties = _enumProps;
exports.isObject = _isObject;
exports.isArrayOfObjects = _isArrayOfObjects;
