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


export const enumProperties = _enumProps;
export const isObject = _isObject;
export const isArrayOfObjects = _isArrayOfObjects;
export const expandRefProp = _expandRefProp;
export const initFromSchema = _initFromSchema;
export const typeOfProperty = _typeOfProperty;



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
		return prop.type === 'object';
	},
	_isArray = function (prop: any, rootSchema: any): boolean {
		return prop.type === 'array';
	},
	_isNumber = function (prop: any, ): boolean {
		return prop.type === 'integer' || prop.type === 'number';
	},
	_isArrayOfObjects = function (prop: any, rootSchema: any): boolean {
		if (prop.type === 'array') {
			let pitems = _expandRefProp(prop.items, rootSchema);
			return pitems.type === 'object'
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
	_initFromSchema = function (schema: any, rootSchema: any, value: any): void {
		value.$states = value.$states || {};
		Object.keys(schema.properties).forEach(function (pn) {
			let cs = schema.properties[pn];
			if (!_ignore(cs, rootSchema)) return;
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
			} else if (_isArrayOfObjects(cs, rootSchema)) {
			} else {
				if (value[pn] === undefined) {
					if (cs.default !== undefined && cs.default !== null)
						value[pn] = _getDefault(cs.default);
					else if (cs.enum)
						value[pn] = cs.enum[0];
					else {
						switch (_typeOfProperty(cs.type)) {
							case JSONTYPES.number:
							case JSONTYPES.integer:
								if (cs.default !== null)
									value[pn] = 0;
								break;
						}
					}
				}
			}
		});

	};


