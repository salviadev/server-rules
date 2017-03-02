import { ModelObject } from './interfaces';
export declare class BaseModel implements ModelObject {
    private _cachePath;
    private _cacheRoot;
    protected _initialized: any;
    isNull: boolean;
    isUndefined: boolean;
    uuid: string;
    protected _frozen: boolean;
    protected _owner: any;
    protected _schema: any;
    protected _model: any;
    protected _children: any;
    protected _states: any;
    protected _errors: any;
    readonly $states: any;
    readonly $schema: any;
    protected _propertyName: string;
    protected getRoot(): BaseModel;
    protected _getPropertyPath(propertyName?: string): string;
    protected setModel(value: any, notify: boolean): void;
    protected afterSetModel(notify: boolean): void;
    protected replaceCompositionObject(propertyName: string, value: any): void;
    protected getFullPath(): string;
    protected _createProperties(): void;
    isArray(): boolean;
    readonly owner: ModelObject;
    addErrors(alerts: {
        message: string;
        severity?: number;
    }[], add?: boolean): void;
    firePropChangedChanged(operation: number, propertyName: string, oldvalue: any, newValue: any, params: any): void;
    fireMetaDataChanged(propertyName: string, params: any): void;
    onStateChange: (propertyName: string, params: any) => void;
    onChange: (propertyName: string, operation: string, params: any) => void;
    constructor(owner: any, propertyName: string, schema: any, value: any);
    destroy(): void;
}
