"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keysToSnakeCase = void 0;
exports.camelToSnake = camelToSnake;
function camelToSnake(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}
const keysToSnakeCase = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj)) {
        return obj.map((v) => (0, exports.keysToSnakeCase)(v));
    }
    else if (obj !== null && obj.constructor === Object) {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [
            camelToSnake(key),
            (0, exports.keysToSnakeCase)(value),
        ]));
    }
    return obj;
};
exports.keysToSnakeCase = keysToSnakeCase;
