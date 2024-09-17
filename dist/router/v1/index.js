"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recipes_js_1 = __importDefault(require("./recipes.js"));
const router = express_1.default.Router();
router.use("/recipes", recipes_js_1.default);
exports.default = router;
