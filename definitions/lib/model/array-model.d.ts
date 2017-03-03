import { BaseModel } from './base-model';
import { ObjectModel } from './object-model';
export declare class ArrayModel extends BaseModel {
    private _items;
    constructor(owner: any, propertyName: string, schema: any, value: any);
    clearItems(): void;
    destroy(): void;
    protected afterSetModel(notify: boolean): void;
    push(modelItem: any): ObjectModel;
    pop(): void;
    get(index: number): ObjectModel;
    readonly length: number;
    insert(index: number, modelItem: any): ObjectModel;
    addError(message: string): void;
    rmvError(message: string): void;
    clearErrors(): void;
}
