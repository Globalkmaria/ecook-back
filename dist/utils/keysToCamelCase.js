"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keysToCamelCase = void 0;
const toCamelCase = (str) => {
    if (str === "_id")
        return "docId";
    return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace(/[-_]/g, ""));
};
const keysToCamelCase = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj)) {
        return obj.map((v) => (0, exports.keysToCamelCase)(v));
    }
    else if (obj !== null && obj.constructor === Object) {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [
            toCamelCase(key),
            (0, exports.keysToCamelCase)(value),
        ]));
    }
    return obj;
};
exports.keysToCamelCase = keysToCamelCase;
