
export const enumProperties = _enumProps;
export const isObject = _isObject;
export const isArrayOfObjects = _isArrayOfObjects;

var
	_isRefObject = function (prop: any): boolean {
		return prop.type === 'ref/object';
	},
	_isRefArray = function (prop: any): boolean {
		return prop.type === 'ref/array';
	},
	_ignore = function (prop: any): boolean {
		return ['ref/array', 'ref/object'].indexOf(prop.type) >= 0;
	},
	_isObject = function (prop: any): boolean {
		return prop.type === 'object';
	},
	_isArray = function (prop: any): boolean {
		return prop.type === 'array';
	},
	_isNumber = function (prop: any): boolean {
		return prop.type === 'integer' || prop.type === 'number';
	},
	_isArrayOfObjects = function (prop: any): boolean {
		return prop.type === 'array' && prop.items.type === 'object';
	},
	_enumProps = function (schema: any, cb: (propertyName: string, value: any, isObject: boolean, isArray: boolean) => void): void {
		Object.keys(schema.properties).forEach(function (propName: string) {
			let item = schema.properties[propName];
			if (_ignore(item)) return;
			cb(propName, item, _isObject(item), _isArray(item));
		});

	};


