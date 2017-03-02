"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONTYPES = {
    string: 'string',
    integer: 'integer',
    boolean: 'boolean',
    number: 'number',
    object: 'object',
    array: 'array',
    // extended
    date: 'date',
    datetime: 'date-time'
};
exports.JSONFORMATS = {
    email: 'email',
    json: 'json',
    money: 'money',
    code: 'code',
    rate: 'rate'
};
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
}, _getDefault = function (vDefault) {
    return vDefault;
}, _typeOfProperty = function (propSchema) {
    let ps = propSchema.type || exports.JSONTYPES.string;
    if (!exports.JSONTYPES[ps])
        throw 'Unsupported schema type : ' + propSchema.type;
    if (propSchema.format) {
        if (ps === exports.JSONTYPES.string) {
            if (propSchema.format === exports.JSONTYPES.date)
                return exports.JSONTYPES.date;
            else if (propSchema.format === exports.JSONTYPES.datetime)
                return exports.JSONTYPES.datetime;
            else if (propSchema.format === exports.JSONTYPES.id)
                return exports.JSONTYPES.id;
        }
        else if (ps === exports.JSONTYPES.integer) {
            if (propSchema.format === exports.JSONTYPES.id)
                return exports.JSONTYPES.id;
        }
    }
    return ps;
}, _initFromSchema = function (schema, rootSchema, value) {
    value.$states = value.$states || {};
    Object.keys(schema.properties).forEach(function (pn) {
        let cs = schema.properties[pn];
        if (!_ignore(cs, rootSchema))
            return;
        let state = schema.states ? schema.states[pn] : null;
        let ns = value.$states[pn] = (value.$states[pn] || {});
        if (state) {
            Object.keys(state).forEach(function (sn) {
                if (ns[sn] === undefined) {
                    ns[sn] = state[sn];
                }
            });
        }
        if (_isObject(cs, rootSchema)) {
            value[pn] = value[pn] || {};
            _initFromSchema(cs, rootSchema, value[pn]);
        }
        else if (_isArrayOfObjects(cs, rootSchema)) {
        }
        else {
            if (value[pn] === undefined) {
                if (cs.default !== undefined && cs.default !== null)
                    value[pn] = _getDefault(cs.default);
                else if (cs.enum)
                    value[pn] = cs.enum[0];
                else {
                    switch (_typeOfProperty(cs.type)) {
                        case exports.JSONTYPES.number:
                        case exports.JSONTYPES.integer:
                            if (cs.default !== null)
                                value[pn] = 0;
                            break;
                    }
                }
            }
        }
    });
};
exports.enumProperties = _enumProps;
exports.isObject = _isObject;
exports.isArrayOfObjects = _isArrayOfObjects;
exports.expandRefProp = _expandRefProp;
exports.initFromSchema = _initFromSchema;
exports.typeOfProperty = _typeOfProperty;
exports.isNumber = _isNumber;
