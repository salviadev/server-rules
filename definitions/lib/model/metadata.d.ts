import { ModelObject } from './interfaces';
import { Errors } from './errors';
export declare class BaseMeta {
    private _owner;
    protected _meta: any;
    private _propName;
    constructor(owner: ModelObject, propName: string, value: any);
    destroy(): void;
    protected init(): void;
    protected notify(propertyName: string): void;
    meta(): any;
    isHidden: boolean;
    isDisabled: boolean;
}
export declare class MetaLink extends BaseMeta {
    constructor(owner: ModelObject, propName: string, value: any);
}
export declare class MetaObject extends BaseMeta {
    private _$errors;
    constructor(owner: ModelObject, propName: string, value: any);
    protected init(): void;
    destroy(): void;
    readonly $errors: Errors;
}
export declare class MetaProperty extends MetaObject {
    constructor(owner: ModelObject, propName: string, value: any);
    protected init(): void;
    isMandatory: boolean;
    isReadOnly: boolean;
}
