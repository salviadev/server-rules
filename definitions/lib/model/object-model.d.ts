import { BaseModel } from './base-model';
export declare class ObjectModel extends BaseModel {
    private _className;
    private _beforeChange(propertyName, schema, oldValue, value, forceContinue);
    protected replaceCompositionObject(propertyName: string, value: any): void;
    private _createErrorProperty(propertyName);
    private _createProperty(propertyName);
    protected afterSetModel(notify: boolean): void;
    constructor(owner: any, propertyName: string, schema: any, value: any);
    destroy(): void;
    addError(message: string): void;
    rmvError(message: string): void;
    clearErrors(): void;
}
