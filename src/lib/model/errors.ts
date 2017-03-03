//OK
import * as utils from '../core/utils';
import { ModelObject } from './interfaces';

export const AlertType = {
    Error: 0,
    Warning: 1,
    Success: 2
}
export class Errors {
    private _propName: string;
    private _owner: ModelObject;
    private _errors: { severity: number, message: string }[];
    constructor(owner: ModelObject, propName: string, value: { severity: number, message: string }[]) {
        var that = this;
        that._errors = value || [];
        that._propName = propName;
        that._owner = owner;
    }
    public destroy() {
        var that = this;
        that._errors = null;
        that._owner = null;
    }
    private notify() {
        var that = this;
        that._owner.fireMetaDataChanged(that._propName + '.$errors', null);
    }
    private _addErrors(alerts: { message: string, severity?: number }[], add?: boolean) {
        let that = this;
        if (add || !utils.equals(that._errors, alerts)) {
            that._errors.length = 0;
            that._errors = utils.extend(that._errors, alerts || [], true);
            that.notify();
        }
    }
    public clearErrors() {
        this.clear(true);
    }
    public clear(notify: boolean): boolean {
        var that = this;
        if (that._errors.length) {
            that._errors.length = 0;
            if (notify) that.notify();
            return true;
        }
        return false;
    }
    public hasErrors(): boolean {
        let that = this;
        return that._errors && that._errors.length ? true : false;
    }

    public addError(message: string) {
        let that = this;
        that._addErrors([{ severity: AlertType.Error, message: message }], true);
    }
    
    public addSuccess(message: string) {
        let that = this;
        that._addErrors([{ severity: AlertType.Success, message: message }], true);
    }
    public addWarning(message: string) {
        let that = this;
        that._addErrors([{ severity: AlertType.Warning, message: message }], true);
    }
    public rmvError(message: string): void {
        let that = this;
        if (that._errors && that._errors.length) {
            let ii = that._errors.findIndex(error => {
                return error.severity === AlertType.Error && error.message === message;
            });
            if (ii >= 0) {
                that._errors.splice(ii, 1);
                that.notify();
            }

        }
    }

}



