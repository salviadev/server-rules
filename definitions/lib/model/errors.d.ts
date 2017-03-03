import { ModelObject } from './interfaces';
export declare const AlertType: {
    Error: number;
    Warning: number;
    Success: number;
};
export declare class Errors {
    private _propName;
    private _owner;
    private _errors;
    constructor(owner: ModelObject, propName: string, value: {
        severity: number;
        message: string;
    }[]);
    destroy(): void;
    private notify();
    private _addErrors(alerts, add?);
    clearErrors(): void;
    clear(notify: boolean): boolean;
    hasErrors(): boolean;
    addError(message: string): void;
    addSuccess(message: string): void;
    addWarning(message: string): void;
    rmvError(message: string): void;
}
