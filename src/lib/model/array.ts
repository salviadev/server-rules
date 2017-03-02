import * as utils from '../core/utils';
import * as schema from './schema';
import * as modelHelper from './helper';
import { Message } from './consts';
import { ModelObject } from './interfaces';
import { BaseModel } from './base-model';
import { ObjectModel } from './object';


export class ArrayModel extends BaseModel {
    private _items: ObjectModel[];
    constructor(owner: any, propertyName: string, schema: any, value: any) {
        super(owner, propertyName, schema, value);
    }
    public clearItems() {
        let that = this;
        if (that._items) {
            that._items.forEach(item => item.destroy());
            that._items = null;
        }
    }
    public destroy() {
        let that = this;
        if (that._items) {
            that._items.forEach(item => item.destroy());
            that._items = null;
        }
        super.destroy();
    }
    protected afterSetModel(notify: boolean): void {
        let that = this;
        that._model = that._model || [];
        that._items = that._items || [];
        that.clearItems();
        // create items
        let root = that.getRoot();
        that._model.forEach((modelItem: any) => {
            that._items.push(new ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem));
        });
        if (notify)
            that.firePropChangedChanged(Message.PropChanged, '', null, null, { source: that._getPropertyPath(), instance: that });
    }
    public push(modelItem: any): ObjectModel {
        let that = this;
        let root = that.getRoot();
        let item = new ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem);
        that._model.push(modelItem);
        that._items.push(item);
        that.firePropChangedChanged(Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        return item;
    }
    public pop(): void {
        let that = this;
        let root = that.getRoot();
        that._model.pop();
        let item = that._items.pop();
        that.firePropChangedChanged(Message.RemoveItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        item.destroy();
    }
    public get(index: number): ObjectModel {
        let that = this;
        if (index < 0 || index > (that._items.length - 1)) return null;
        return that._items[index];

    }
    public insert(index: number, modelItem: any): ObjectModel {
        let that = this;
        let root = that.getRoot();
        let item = new ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem);
        if (index >= 0 && index < (that._model.length - 1)) {
            that._model.splice(index, 0, modelItem);
            that._items.splice(index, 0, item);
        } else {
            that._model.push(modelItem);
            that._items.push(item);
        }
        that._items.push(item);
        that.firePropChangedChanged(Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        return item;
    }

}
