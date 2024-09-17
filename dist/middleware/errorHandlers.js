"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const notFound = (req, res, next) => {
    res.sendStatus(404);
};
exports.notFound = notFound;
const errorHandler = (error, req, res, next) => {
    console.error(error);
    res.sendStatus(500);
};
exports.errorHandler = errorHandler;
