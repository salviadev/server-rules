"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema = require("./schema");
const consts_1 = require("./consts");
const base_model_1 = require("./base-model");
const object_1 = require("./object");
class ArrayModel extends base_model_1.BaseModel {
    constructor(owner, propertyName, schema, value) {
        super(owner, propertyName, schema, value);
    }
    clearItems() {
        let that = this;
        if (that._items) {
            that._items.forEach(item => item.destroy());
            that._items = null;
        }
    }
    destroy() {
        let that = this;
        if (that._items) {
            that._items.forEach(item => item.destroy());
            that._items = null;
        }
        super.destroy();
    }
    afterSetModel(notify) {
        let that = this;
        that._model = that._model || [];
        that._items = that._items || [];
        that.clearItems();
        // create items
        let root = that.getRoot();
        that._model.forEach((modelItem) => {
            that._items.push(new object_1.ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem));
        });
        if (notify)
            that.firePropChangedChanged(consts_1.Message.PropChanged, '', null, null, { source: that._getPropertyPath(), instance: that });
    }
    push(modelItem) {
        let that = this;
        let root = that.getRoot();
        let item = new object_1.ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem);
        that._model.push(modelItem);
        that._items.push(item);
        that.firePropChangedChanged(consts_1.Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        return item;
    }
    pop() {
        let that = this;
        let root = that.getRoot();
        that._model.pop();
        let item = that._items.pop();
        that.firePropChangedChanged(consts_1.Message.RemoveItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        item.destroy();
    }
    get(index) {
        let that = this;
        if (index < 0 || index > (that._items.length - 1))
            return null;
        return that._items[index];
    }
    insert(index, modelItem) {
        let that = this;
        let root = that.getRoot();
        let item = new object_1.ObjectModel(that, '$item', schema.expandRefProp(that.$schema, root.$schema), modelItem);
        if (index >= 0 && index < (that._model.length - 1)) {
            that._model.splice(index, 0, modelItem);
            that._items.splice(index, 0, item);
        }
        else {
            that._model.push(modelItem);
            that._items.push(item);
        }
        that._items.push(item);
        that.firePropChangedChanged(consts_1.Message.AddItem, '', null, null, { source: that._getPropertyPath(), instance: that, item: item });
        return item;
    }
}
exports.ArrayModel = ArrayModel;
