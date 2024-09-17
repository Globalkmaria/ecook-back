"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const index_js_1 = require("../config/index.js");
const mysqlDB = promise_1.default.createPool({
    host: index_js_1.config.mysql.host,
    user: index_js_1.config.mysql.user,
    password: index_js_1.config.mysql.password,
    database: index_js_1.config.mysql.database,
    port: index_js_1.config.mysql.port,
});
exports.default = mysqlDB;
