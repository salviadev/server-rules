
export const enumProperties = _enumProps;
export const isObject = _isObject;
export const isArrayOfObjects = _isArrayOfObjects;
export const expandRefProp = _expandRefProp;
export const initFromSchema =  _initFromSchema;


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
	_initFromSchema = function(schema: any, rootSchema: any, value: any):void {

	};


