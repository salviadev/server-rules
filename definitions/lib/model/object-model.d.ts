import { BaseModel } from './base-model';
export declare class ObjectModel extends BaseModel {
    private _stack;
    private _beforeChange(propertyName, schema, oldValue, value, forceContinue);
    protected replaceCompositionObject(propertyName: string, value: any): void;
    private _createErrorProperty(propertyName);
    private _createProperty(propertyName);
    private _isRecursiveRule(propertyName);
    protected _schemaValidate(operation: number, propertyName: string): boolean;
    protected _execRulesOnPropChange(operation: number, propertyName: string, params: any): void;
    protected afterSetModel(notify: boolean): void;
    constructor(owner: any, propertyName: string, schema: any, value: any);
    stack(): string[];
    destroy(): void;
    addError(message: string): void;
    rmvError(message: string): void;
    clearErrors(): void;
    validate(): boolean;
    protected _clearErrorsForProperty(propertyName: string): void;
}
