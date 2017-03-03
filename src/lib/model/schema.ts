import { currentLocale } from '../localisation/locale'
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
			return pitems.type === JSONTYPES.object
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
	_initFromSchema = function (schema: any, rootSchema: any, value: any, isCreate: boolean): void {
		value.$states = value.$states || {};
		Object.keys(schema.properties).forEach(function (pn) {
			let cs = schema.properties[pn];
			if (_ignore(cs, rootSchema)) return;
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
					// in creaate mode load default values
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
