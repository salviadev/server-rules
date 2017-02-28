
import * as utils from '../core/utils';
import {ModelObject}  from './interfaces';
import {Errors}  from './errors';

export class BaseMeta {
	private _owner: ModelObject;
	protected _meta: any;
	private _propName: string;
	constructor(owner: ModelObject, propName: string, value: any) {
		var that = this;
		that._owner = owner;
		that._propName = propName;
		that._meta = value || { isHidden: false, isDisabled: false };
		that.init();
	}
	public destroy() {
		var that = this;
		that._meta = null;
		that._owner = null;

	}
	protected init() {
		let that = this;
		that._meta.isHidden = that._meta.isHidden || false;
		that._meta.isDisabled = that._meta.isDisabled || false;
	}
	protected notify(propertyName: string) {
		let that = this;
		if (that._owner)
			that._owner.fireMetaDataChanged(that._propName + '.' + propertyName, {});
	}
	public meta() {
		return this._meta;
	}
	public get isHidden(): boolean {
		return _checkBool(this._meta.isHidden);
	}
	public set isHidden(value: boolean) {
		let that = this;
		if (_checkBool(that._meta.isHidden) !== value) {
			that._meta.isHidden = value;
			that.notify('isHidden');
		}
	}
	public get isDisabled(): boolean {
		return _checkBool(this._meta.isDisabled);
	}

	public set isDisabled(value: boolean) {
		let that = this;
		if (_checkBool(that._meta.isDisabled) !== value) {
			that._meta.isDisabled == value;
			that.notify('isDisabled');
		}
	}

};


export class MetaLink extends BaseMeta {
	constructor(owner: ModelObject, propName: string, value: any) {
		super(owner, propName, value);
	}
}
export class MetaObject extends BaseMeta {
	private _$errors: Errors;
	constructor(owner: ModelObject, propName: string, value: any) {
		super(owner, propName, value);
		let that = this;
		that._$errors = new Errors(owner, propName, that._meta.$errors);
	}
	protected init() {
		super.init();
		let that = this;
		that._meta.$errors = that._meta.$errors || [];
	}
	public destroy() {
		var that = this;
		if (that._$errors) {
			that._$errors.destroy();
			that._$errors = null;
		}
		super.destroy();
	}
	public get $errors(): Errors {
		return this._$errors;
	}
}


export class MetaProperty extends MetaObject {
	constructor(owner: ModelObject, propName: string, value: any) {
		super(owner, propName, value);
	}
	protected init() {
		super.init();
		let that = this;
		that._meta.isMandatory = that._meta.isMandatory || false;
		that._meta.isReadOnly = that._meta.isReadOnly || false;
	}
	public get isMandatory(): boolean {
		return _checkBool(this._meta.isMandatory);
	}

	public set isMandatory(value: boolean) {
		let that = this;
		if (_checkBool(that._meta.isMandatory) !== value) {
			that._meta.isMandatory = value;
			that.notify('isMandatory');
		}
	}
	public get isReadOnly(): boolean {
		return _checkBool(this._meta.isReadOnly);
	}

	public set isReadOnly(value: boolean) {
		let that = this;
		if (_checkBool(that._meta.isReadOnly) !== value) {
			that._meta.isReadOnly = value;
			that.notify('isReadOnly');
		}
	}
}


function _checkBool(value?: boolean) {
	if (value === undefined) return false
	return value;

}
