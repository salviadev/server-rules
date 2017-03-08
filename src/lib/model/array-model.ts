import * as utils from '../core/utils';
import * as schemaUtils from './schema';
import { Message } from './consts';
import { ModelObject } from './interfaces';
import { BaseModel } from './base-model';
import { ObjectModel } from './object-model';



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
        that.clearItems();
        that._items = that._items || [];
        that._create = that._owner.$create;
        // create items
        let root = that.getRoot();
        that._model.forEach((modelItem: any) => {
            that._items.push(new ObjectModel(that, '$item', schemaUtils.expandRefProp(that.$schema.items, root.$schema), modelItem));
        });
        if (notify)
            that.firePropChangedChanged(Message.PropChanged, '', null, null, { source: that._getPropertyPath(), instance: that }, true);
    }

    public push(modelItem: any): ObjectModel {
        let that = this;
        let root = that.getRoot();
        modelItem.$create = true;
        let item = new ObjectModel(that, '$item', schemaUtils.expandRefProp(that.$schema.items, root.$schema), modelItem);
        that._model.push(modelItem);
        that._items.push(item);
        that.firePropChangedChanged(Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item }, true);
       
        
        return item;
    }

    public forEach(cb: (item: ObjectModel, index: number) => void): void {
        let that = this;
        that._items.forEach((item, index) => cb(item, index))
    }
    public pop(): void {
        let that = this;
        let root = that.getRoot();
        that._model.pop();
        let item = that._items.pop();
        that.firePropChangedChanged(Message.RemoveItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item }, true);
        item.destroy();
    }
    public remove(item: ObjectModel): void {
        let that = this;
        let root = that.getRoot();
        let ii = that._items.indexOf(item);
        if (ii >= 0) {
            that._model.splice(ii, 1);
            that._items.splice(ii, 1);
            that.firePropChangedChanged(Message.RemoveItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item }, true);
            item.destroy();
        }
    }

    public get(index: number): ObjectModel {
        let that = this;
        if (index < 0 || index > (that._items.length - 1)) return null;
        return that._items[index];

    }
    public get length(): number {
        return this._items.length;
    }
    public insert(index: number, modelItem: any): ObjectModel {
        let that = this;
        let root = that.getRoot();
        let item = new ObjectModel(that, '$item', schemaUtils.expandRefProp(that.$schema.items, root.$schema), modelItem);
        if (index >= 0 && index < (that._model.length - 1)) {
            that._model.splice(index, 0, modelItem);
            that._items.splice(index, 0, item);
        } else {
            that._model.push(modelItem);
            that._items.push(item);
        }
        that._items.push(item);
        that.firePropChangedChanged(Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item }, true);
        return item;
    }
    public addError(message: string): void {
        let that = this;
        that._owner.$errors[that._propertyName].addError(message);
    }
    public rmvError(message: string): void {
        let that = this;
        that._owner.$errors[that._propertyName].rmvError(message);
    }
    public clearErrors(): void {
        let that = this;
        that._owner.$errors[that._propertyName].clearErrors();
        that._items.forEach(item => item.clearErrors());
    }

    public validate(): boolean {
        let that = this;
        let res = super.validate();
        that._items.forEach(item => {
            if (!item.validate()) res = false;
        });
        return res;
    }



}
