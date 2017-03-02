import { BaseModel } from './base-model';
import { ObjectModel } from './object';
export declare class ArrayModel extends BaseModel {
    private _items;
    constructor(owner: any, propertyName: string, schema: any, value: any);
    clearItems(): void;
    destroy(): void;
    protected afterSetModel(notify: boolean): void;
    push(modelItem: any): ObjectModel;
    pop(): void;
    get(index: number): ObjectModel;
    insert(index: number, modelItem: any): ObjectModel;
}
