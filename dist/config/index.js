"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessions = exports.corsOption = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
const required = (key, defaultValue = undefined) => {
    const value = process.env[key] || defaultValue;
    if (value == null) {
        throw new Error(`Key ${key} is undefined`);
    }
    return value;
};
exports.config = {
    session: {
        secret: required("SESSION_SECRET"),
    },
    server: {
        url: required("SERVER_URL"),
    },
    port: parseInt(required("PORT")),
    cors: {
        allowedOrigin: required("CORS_ALLOW_ORIGIN"),
    },
    frontend: {
        url: required("FRONTEND_URL"),
    },
    mysql: {
        host: required("MYSQL_HOST"),
        user: required("MYSQL_USER"),
        password: required("MYSQL_PASSWORD"),
        database: required("MYSQL_NAME"),
        port: required("MYSQL_PORT"),
    },
};
exports.corsOption = {
    origin: exports.config.cors.allowedOrigin,
    optionsSuccessStatus: 200,
    credentials: true,
};
const sessionOptions = {
    secret: exports.config.session.secret,
    resave: false,
    saveUninitialized: false,
};
const getSessions = () => sessionOptions;
exports.getSessions = getSessions;
