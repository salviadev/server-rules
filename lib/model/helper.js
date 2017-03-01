"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyObject = _destroyObject;
var _destroyObject = (obj) => {
    if (obj) {
        Object.keys(obj).forEach((ii) => {
            ii.destroy();
        });
    }
    ;
};
