"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _destroyObject = (obj) => {
    if (obj) {
        Object.keys(obj).forEach((name) => {
            let ii = obj[name];
            ii.destroy();
        });
    }
    ;
};
exports.destroyObject = _destroyObject;
