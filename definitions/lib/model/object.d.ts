import { ModelObject } from './interfaces';
export declare class BaseModel implements ModelObject {
    private _cachePath;
    isNull: boolean;
    isUndefined: boolean;
    uuid: string;
    protected _frozen: boolean;
    protected _owner: any;
    protected _schema: any;
    protected _model: any;
    protected _propertyName: string;
    protected getFullPath(): string;
    isArray(): boolean;
    readonly owner: ModelObject;
    addErrors(alerts: {
        message: string;
        severity?: number;
    }[], add?: boolean): void;
    fireMetaDataChanged(propertyName: string, params: any): void;
    onStateChange: (propertyName: string, params: any) => void;
    onChange: (propertyName: string, operation: string, params: any) => void;
    constructor(owner: any, propertyName: string, schema: any, value: any);
}
