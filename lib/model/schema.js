"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumProperties = _enumProps;
exports.isObject = _isObject;
exports.isArrayOfObjects = _isArrayOfObjects;
exports.expandRefProp = _expandRefProp;
exports.initFromSchema = _initFromSchema;
const DEF_LINK = '#/definitions/';
const DEF_LINK_LEN = DEF_LINK.length;
var _expandRefProp = function (schema, rootSchema) {
    if (schema.$ref) {
        let refEntity = schema.$ref.substr(DEF_LINK_LEN);
        let refSchema = rootSchema.definitions ? rootSchema.definitions[refEntity] : null;
        if (!refSchema)
            throw 'Schema $ref not found : ' + schema.$ref;
        return refSchema;
    }
    return schema;
}, _ignore = function (prop, rootSchema) {
    return ['ref/array', 'ref/object'].indexOf(prop.type) >= 0;
}, _isObject = function (prop, rootSchema) {
    return prop.type === 'object';
}, _isArray = function (prop, rootSchema) {
    return prop.type === 'array';
}, _isNumber = function (prop) {
    return prop.type === 'integer' || prop.type === 'number';
}, _isArrayOfObjects = function (prop, rootSchema) {
    if (prop.type === 'array') {
        let pitems = _expandRefProp(prop.items, rootSchema);
        return pitems.type === 'object';
    }
    else
        return false;
}, _enumProps = function (schema, rootSchema, cb) {
    Object.keys(schema.properties).forEach(function (propName) {
        let item = schema.properties[propName];
        if (_ignore(item, rootSchema))
            return;
        cb(propName, item, _isObject(item, rootSchema), _isArray(item, rootSchema));
    });
}, _initFromSchema = function (schema, rootSchema, value) {
};
