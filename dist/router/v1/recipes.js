"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_js_1 = __importDefault(require("../../db/mysql.js"));
const router = express_1.default.Router();
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield mysql_js_1.default.query(`SELECT * FROM recipes_simple_view`);
        // const recipes = new Map<
        //   String,
        //   {
        //     name: string;
        //     simple_description: string;
        //     recipe_img: string;
        //   }
        // >();
        // const recipes = result.map((recipe) => ({
        //   id: recipe.id,
        //   name: recipe.name,
        //   difficulty: recipe.recipe_difficulty,
        //   ingredients: recipe.ingredients.split(","),
        // }));
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
