"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./config/index.js");
const index_js_2 = __importDefault(require("./router/v1/index.js"));
const errorHandlers_js_1 = require("./middleware/errorHandlers.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)(index_js_1.corsOption));
app.use((0, express_session_1.default)((0, index_js_1.getSessions)()));
app.use("/api/v1", index_js_2.default);
app.use(errorHandlers_js_1.notFound);
app.use(errorHandlers_js_1.errorHandler);
app.listen(index_js_1.config.port, () => {
    console.log(`Server running on port ${index_js_1.config.port}`);
});
