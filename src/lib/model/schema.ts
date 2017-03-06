import { currentLocale, currentLang, formatMoney, formatDecimal } from '../localisation/locale'
import { messages } from '../localisation/messages'
import { formatByPosition } from '../core/utils'
import { Errors } from './errors'
import { ModelObject } from './interfaces'


export const JSONTYPES: any = {
	string: 'string',
	integer: 'integer',
	boolean: 'boolean',
	number: 'number',
	object: 'object',
	array: 'array',
	// extended
	date: 'date',
	datetime: 'date-time'
}

export const JSONFORMATS = {
	email: 'email',
	json: 'json',
	money: 'money',
	code: 'code',
	rate: 'rate'
}





const DEF_LINK = '#/definitions/';
const DEF_LINK_LEN = DEF_LINK.length;
var
	_expandRefProp = function (schema: any, rootSchema: any): any {
		if (schema.$ref) {
			let refEntity = schema.$ref.substr(DEF_LINK_LEN);
			let refSchema = rootSchema.definitions ? rootSchema.definitions[refEntity] : null;
			if (!refSchema)
				throw 'Schema $ref not found : ' + schema.$ref;
			return refSchema;
		}
		return schema;
	},
	_ignore = function (prop: any, rootSchema: any): boolean {
		return ['ref/array', 'ref/object'].indexOf(prop.type) >= 0;
	},
	_isObject = function (prop: any, rootSchema: any): boolean {
		return prop.type === JSONTYPES.object;
	},
	_isArray = function (prop: any, rootSchema: any): boolean {
		return prop.type === JSONTYPES.array;
	},
	_isNumber = function (prop: any, ): boolean {
		return prop.type === JSONTYPES.number || prop.type === JSONTYPES.integer;
	},
	_isInteger = function (prop: any, ): boolean {
		return prop.type === JSONTYPES.integer;
	},
	_isArrayOfObjects = function (prop: any, rootSchema: any): boolean {
		if (prop.type === JSONTYPES.array) {
			let pitems = _expandRefProp(prop.items, rootSchema);
			return pitems.type === JSONTYPES.object;
		} else
			return false;
	},
	_enumProps = function (schema: any, rootSchema: any, cb: (propertyName: string, value: any, isObject: boolean, isArray: boolean) => void): void {
		Object.keys(schema.properties).forEach(function (propName: string) {
			let item = schema.properties[propName];
			if (_ignore(item, rootSchema)) return;
			cb(propName, item, _isObject(item, rootSchema), _isArray(item, rootSchema));
		});

	},
	_getDefault = function (vDefault: any): any {
		return vDefault;

	},
	_typeOfProperty = function (propSchema: { type?: string, format?: string, reference?: string }): string {
		let ps = propSchema.type || JSONTYPES.string;
		if (!JSONTYPES[ps])
			throw 'Unsupported schema type : ' + propSchema.type;
		if (propSchema.format) {
			if (ps === JSONTYPES.string) {
				if (propSchema.format === JSONTYPES.date)
					return JSONTYPES.date;
				else if (propSchema.format === JSONTYPES.datetime)
					return JSONTYPES.datetime;
				else if (propSchema.format === JSONTYPES.id)
					return JSONTYPES.id;
			} else if (ps === JSONTYPES.integer) {
				if (propSchema.format === JSONTYPES.id)
					return JSONTYPES.id;

			}
		}
		return ps;
	},
	_initializeSchemaState = function (schema: any, roolSchema: any, schemaStates: any) {
		let pt = _typeOfProperty(schema);
		switch (pt) {
			case JSONTYPES.integer:
				schema.decimals = 0;
				break;
			case JSONTYPES.number:
				if (schema.format === JSONFORMATS.rate) {
					if (schema.decimals === undefined) schema.decimals = 2;
					if (schema.minimum === undefined) schema.minimum = 0;
					if (schema.maximum === undefined) schema.maximum = 100;
					if (schema.symbol === undefined) schema.symbol = '%';
				} else if (schema.format === JSONFORMATS.money) {
					if (schema.decimals === undefined) schema.decimals = currentLocale.number.decimalPlaces;
					if (schema.symbol === undefined) schema.symbol = currentLocale.number.symbol;
				}
				break;
			case JSONTYPES.string:
				if (schema.maxLength === undefined) schemaStates.maxLength = 2;
				if (schema.minLength === undefined) schemaStates.minLength = 2;

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

	},
	_formatNumber = (state: any, schema: any, value: number): string => {
		if (schema.format == JSONFORMATS.money)
			return formatMoney(value, false);
		return formatDecimal(value, schema.decimals || 0, null);
	},
	_checkNumber = (value: any, state: any, schema: any, errors: Errors): boolean => {
		let res = true;
		if (schema.exclusiveMinimum) {
			if (state.minimum != undefined && value <= state.minimum) {
				errors.addError(formatByPosition(messages(currentLang).schema.minNumberExclusive, schema.title, _formatNumber(state, schema, state.minimum)));
				res = false;
			}
		} else {
			if (schema.minimum != undefined && value < schema.minimum) {
				errors.addError(formatByPosition(messages(currentLang).schema.minNumber, schema.title, _formatNumber(state, schema, state.minimum)));
				res = false;
			}
		}
		if (schema.exclusiveMaximum) {
			if (schema.maximum != undefined && value >= schema.maximum) {
				errors.addError(formatByPosition(messages(currentLang).schema.maxNumberExclusive, schema.title, _formatNumber(state, schema, state.maximum)));
				res = false;
			}
		} else {
			if (schema.maximum != undefined && value > schema.maximum) {
				errors.addError(formatByPosition(messages(currentLang).schema.maxNumber, schema.title, _formatNumber(state, schema, state.maximum)));
				res = false;
			}
		}
		return res;
	},
	_validateEmail = (email: string, error: any): boolean => {
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return re.test(email);
	},
	_validateJson = (value: string, error: any): boolean => {
		try {
			JSON.parse(value);
		} catch (ex) {
			error.ex = ex;
			return false;
		}
		return true;

	},

	_checkString = (value: any, state: any, schema: any, errors: Errors): boolean => {
		let res = true;
		let v = (value || '');
		if (state.minLength && v.length < state.minLength) {
			errors.addError(formatByPosition(messages(currentLang).schema.minLength, schema.title, state.minLength));
			res = false;
		}
		if (state.isMandatory) {
			if (v === '') {
				errors.addError(formatByPosition(messages(currentLang).schema.required, schema.title));
				res = false;
			}
		}
		if (schema.format) {
			if (schema.format === JSONFORMATS.email) {
				if (value && !_validateEmail(value, {})) {
					errors.addError(messages(currentLang).schema.invalidEmail);
					res = false;
				}

			} else if (schema.format === JSONFORMATS.json) {
				let error: any = {};
				if (value && !_validateJson(value, error)) {
					errors.addError(error.ex.message);
					res = false;
				}
			}
		}
		return res;
	},

	_pkFields = (pk: any): string[] => {
		if (Array.isArray(pk))
			return pk;
		else
			return pk.split(',').map(function (v: string) { return v.trim() });
	},
	_extractPkValue = (item: any, map: string[]): any => {
		if (map.length == 1) return item[map[0]];
		let o: any = {};
		map.forEach((p: string) => { o[p] = item[p]; });
		return o;
	},


	_checkArray = (value: any, state: any, schema: any, rootSchema: any, errors: Errors): boolean => {
		let res = true;
		let pitems = _expandRefProp(schema.items, rootSchema);
		if (pitems.primaryKey && pitems.type === JSONTYPES.object && value && value.length) {
			let keys = _pkFields(pitems.primaryKey);
			let error = false;
			let pks: string[] = [];

			value.forEach((item: ModelObject) => {
				if (error) return;
				let model = item.model();
				let ivalue = JSON.stringify(_extractPkValue(model, keys));
				if (pks.indexOf(ivalue) < 0)
					pks.push(ivalue);
				else
					error = true;
			});
			if (error) {
				let msg = keys.length > 1 ? messages(currentLang).schema.uniqueColumns : messages(currentLang).schema.uniqueColumn;
				value.addError(formatByPosition(msg, keys.join(', ')))
				res = false;
			}

		}
		return res;
	},

	_validateSchema = (value: any, schema: any, rootSchema: any, state: any, errors: Errors): boolean => {
		let res = true;
		if (!schema) return;
		if (state) {
			if (state.isHidden || state.isDisabled)
				return res;
		}
		switch (schema.type) {
			case JSONTYPES.number:
			case JSONTYPES.integer:
				res = _checkNumber(value, state, schema, errors);
				break;
			case JSONTYPES.string:
				res = _checkString(value, state, schema, errors);
				break;

			case JSONTYPES.array:
				res = _checkArray(value, state, schema, rootSchema, errors);
				break;
		}
		return res;
	},
	_initFromSchema = function (schema: any, rootSchema: any, value: any, isCreate: boolean): void {
		value.$states = value.$states || {};
		value.$create = isCreate;
		schema.states = schema.states || {};
		Object.keys(schema.properties).forEach(function (pn) {
			let cs = schema.properties[pn];
			if (_ignore(cs, rootSchema)) return;
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
			} else if (_isArrayOfObjects(cs, rootSchema)) {
				value[pn] = value[pn] || (isCreate ? [] : null);
				if (value[pn] && value[pn].length) {
					let itemsSchema = _expandRefProp(cs.items, rootSchema);
					value[pn].forEach((ii: any) => {
						_initFromSchema(itemsSchema, rootSchema, ii, isCreate);
					});
				}
			} else {
				if (isCreate) {
					// in create mode load default values
					if (value[pn] === undefined) {
						if (cs.default !== undefined && cs.default !== null)
							value[pn] = _getDefault(cs.default);
						else if (cs.enum)
							value[pn] = cs.enum[0];
						else {
							switch (_typeOfProperty(cs)) {
								case JSONTYPES.number:
								case JSONTYPES.integer:
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

export const enumProperties = _enumProps;
export const isObject = _isObject;
export const isArrayOfObjects = _isArrayOfObjects;
export const expandRefProp = _expandRefProp;
export const initFromSchema = _initFromSchema;
export const typeOfProperty = _typeOfProperty;
export const isNumber = _isNumber;
export const validateProperty = _validateSchema;


