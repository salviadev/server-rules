"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_model_1 = require("./object-model");
function createInstance(schema, data) {
    return new object_model_1.ObjectModel(null, '', schema, data);
}
exports.createInstance = createInstance;
