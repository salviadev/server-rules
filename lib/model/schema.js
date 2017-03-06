"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locale_1 = require("../localisation/locale");
const messages_1 = require("../localisation/messages");
const utils_1 = require("../core/utils");
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
    return prop.type === exports.JSONTYPES.object;
}, _isArray = function (prop, rootSchema) {
    return prop.type === exports.JSONTYPES.array;
}, _isNumber = function (prop) {
    return prop.type === exports.JSONTYPES.number || prop.type === exports.JSONTYPES.integer;
}, _isInteger = function (prop) {
    return prop.type === exports.JSONTYPES.integer;
}, _isArrayOfObjects = function (prop, rootSchema) {
    if (prop.type === exports.JSONTYPES.array) {
        let pitems = _expandRefProp(prop.items, rootSchema);
        return pitems.type === exports.JSONTYPES.object;
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
}, _initializeSchemaState = function (schema, roolSchema, schemaStates) {
    let pt = _typeOfProperty(schema);
    switch (pt) {
        case exports.JSONTYPES.integer:
            schema.decimals = 0;
            break;
        case exports.JSONTYPES.number:
            if (schema.format === exports.JSONFORMATS.rate) {
                if (schema.decimals === undefined)
                    schema.decimals = 2;
                if (schema.minimum === undefined)
                    schema.minimum = 0;
                if (schema.maximum === undefined)
                    schema.maximum = 100;
                if (schema.symbol === undefined)
                    schema.symbol = '%';
            }
            else if (schema.format === exports.JSONFORMATS.money) {
                if (schema.decimals === undefined)
                    schema.decimals = locale_1.currentLocale.number.decimalPlaces;
                if (schema.symbol === undefined)
                    schema.symbol = locale_1.currentLocale.number.symbol;
            }
            break;
        case exports.JSONTYPES.string:
            break;
    }
    if (_isNumber(schema)) {
        if (schema.minimum !== undefined)
            schemaStates.minimum = schema.minimum;
        if (schema.maximum !== undefined)
            schemaStates.maximum = schema.maximum;
        if (schema.exclusiveMaximum !== undefined)
            schemaStates.exclusiveMaximum = schema.exclusiveMaximum;
        if (schema.exclusiveMinimum !== undefined)
            schemaStates.exclusiveMinimum = schema.exclusiveMinimum;
        if (schema.decimals !== undefined)
            schemaStates.decimals = schema.decimals;
        if (schema.symbol !== undefined)
            schemaStates.symbol = schema.symbol;
    }
}, _formatNumber = (state, schema, value) => {
    if (schema.format == exports.JSONFORMATS.money)
        return locale_1.formatMoney(value, false);
    return locale_1.formatDecimal(value, schema.decimals || 0, null);
}, _checkNumber = (value, state, schema, errors) => {
    let res = true;
    if (schema.exclusiveMinimum) {
        if (state.minimum != undefined && value <= state.minimum) {
            errors.addError(utils_1.formatByPosition(messages_1.messages(locale_1.currentLang).schema.minNumberExclusive, schema.title, _formatNumber(state, schema, state.minimum)));
            res = false;
        }
    }
    else {
        if (schema.minimum != undefined && value < schema.minimum) {
            errors.addError(utils_1.formatByPosition(messages_1.messages(locale_1.currentLang).schema.minNumber, schema.title, _formatNumber(state, schema, state.minimum)));
            res = false;
        }
    }
    if (schema.exclusiveMaximum) {
        if (schema.maximum != undefined && value >= schema.maximum) {
            errors.addError(utils_1.formatByPosition(messages_1.messages(locale_1.currentLang).schema.maxNumberExclusive, schema.title, _formatNumber(state, schema, state.maximum)));
            res = false;
        }
    }
    else {
        if (schema.maximum != undefined && value > schema.maximum) {
            errors.addError(utils_1.formatByPosition(messages_1.messages(locale_1.currentLang).schema.maxNumber, schema.title, _formatNumber(state, schema, state.maximum)));
            res = false;
        }
    }
    return res;
}, _validateEmail = (email, error) => {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}, _validateJson = (value, error) => {
    try {
        JSON.parse(value);
    }
    catch (ex) {
        error.ex = ex;
        return false;
    }
    return true;
}, _checkString = (value, state, schema, errors) => {
    let res = true;
    let v = (value || '');
    if (state.minLength && v.length < state.minLength) {
        errors.addError(utils_1.formatByPosition(messages_1.messages(locale_1.currentLang).schema.minLength, schema.title, state.minLength));
        res = false;
    }
    if (state.isMandatory) {
        if (v === '') {
            errors.addError(utils_1.formatByPosition(messages_1.messages(locale_1.currentLang).schema.required, schema.title));
            res = false;
        }
    }
    if (schema.format) {
        if (schema.format === exports.JSONFORMATS.email) {
            if (value && !_validateEmail(value, {})) {
                errors.addError(messages_1.messages(locale_1.currentLang).schema.invalidEmail);
                res = false;
            }
        }
        else if (schema.format === exports.JSONFORMATS.json) {
            let error = {};
            if (value && !_validateJson(value, error)) {
                errors.addError(error.ex.message);
                res = false;
            }
        }
    }
    return res;
}, _pkFields = (pk) => {
    if (Array.isArray(pk))
        return pk;
    else
        return pk.split(',').map(function (v) { return v.trim(); });
}, _extractPkValue = (item, map) => {
    if (map.length == 1)
        return item[map[0]];
    let o = {};
    map.forEach((p) => { o[p] = item[p]; });
    return o;
}, _checkArray = (value, state, schema, rootSchema, errors) => {
    let res = true;
    let pitems = _expandRefProp(schema.items, rootSchema);
    if (pitems.primaryKey && pitems.type === exports.JSONTYPES.object && value && value.length) {
        let keys = _pkFields(pitems.primaryKey);
        let error = false;
        let pks = [];
        value.forEach((item) => {
            if (error)
                return;
            let model = item.model();
            let ivalue = JSON.stringify(_extractPkValue(model, keys));
            if (pks.indexOf(ivalue) < 0)
                pks.push(ivalue);
            else
                error = true;
        });
        if (error) {
            let msg = keys.length > 1 ? messages_1.messages(locale_1.currentLang).schema.uniqueColumns : messages_1.messages(locale_1.currentLang).schema.uniqueColumn;
            value.addError(utils_1.formatByPosition(msg, keys.join(', ')));
            res = false;
        }
    }
    return res;
}, _validateSchema = (value, schema, rootSchema, state, errors) => {
    let res = true;
    if (!schema)
        return;
    if (state) {
        if (state.isHidden || state.isDisabled)
            return res;
    }
    switch (schema.type) {
        case exports.JSONTYPES.number:
        case exports.JSONTYPES.integer:
            res = _checkNumber(value, state, schema, errors);
            break;
        case exports.JSONTYPES.string:
            res = _checkString(value, state, schema, errors);
            break;
        case exports.JSONTYPES.array:
            res = _checkArray(value, state, schema, rootSchema, errors);
            break;
    }
    return res;
}, _initFromSchema = function (schema, rootSchema, value, isCreate) {
    value.$states = value.$states || {};
    value.$create = isCreate;
    schema.states = schema.states || {};
    Object.keys(schema.properties).forEach(function (pn) {
        let cs = schema.properties[pn];
        if (_ignore(cs, rootSchema))
            return;
        if (!_isObject(cs, rootSchema)) {
            let state = schema.states[pn] = schema.states[pn] || {};
            let ns = value.$states[pn] = value.$states[pn] || {};
            if (!state._initialized) {
                _initializeSchemaState(cs, rootSchema, state);
                state._initialized = true;
            }
            Object.keys(state).forEach(function (sn) {
                if (ns[sn] === undefined) {
                    ns[sn] = state[sn];
                }
            });
        }
        if (_isObject(cs, rootSchema)) {
            value[pn] = value[pn] || (isCreate ? {} : null);
            if (value[pn])
                _initFromSchema(cs, rootSchema, value[pn], isCreate);
        }
        else if (_isArrayOfObjects(cs, rootSchema)) {
            value[pn] = value[pn] || (isCreate ? [] : null);
            if (value[pn] && value[pn].length) {
                let itemsSchema = _expandRefProp(cs.items, rootSchema);
                value[pn].forEach((ii) => {
                    _initFromSchema(itemsSchema, rootSchema, ii, isCreate);
                });
            }
        }
        else {
            if (isCreate) {
                // in create mode load default values
                if (value[pn] === undefined) {
                    if (cs.default !== undefined && cs.default !== null)
                        value[pn] = _getDefault(cs.default);
                    else if (cs.enum)
                        value[pn] = cs.enum[0];
                    else {
                        switch (_typeOfProperty(cs)) {
                            case exports.JSONTYPES.number:
                            case exports.JSONTYPES.integer:
                                if (cs.default !== null)
                                    value[pn] = 0;
                                break;
                        }
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
exports.validateProperty = _validateSchema;
