export declare const JSONTYPES: any;
export declare const JSONFORMATS: {
    email: string;
    json: string;
    money: string;
    code: string;
    rate: string;
};
export declare const enumProperties: (schema: any, rootSchema: any, cb: (propertyName: string, value: any, isObject: boolean, isArray: boolean) => void) => void;
export declare const isObject: (prop: any, rootSchema: any) => boolean;
export declare const isArrayOfObjects: (prop: any, rootSchema: any) => boolean;
export declare const expandRefProp: (schema: any, rootSchema: any) => any;
export declare const initFromSchema: (schema: any, rootSchema: any, value: any) => void;
export declare const typeOfProperty: (propSchema: {
    type?: string;
    format?: string;
    reference?: string;
}) => string;
