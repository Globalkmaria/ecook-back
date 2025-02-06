import express from "express";
import { homeRecipes } from "../../../controller/recipes/recipesHomeController.js";

const router = express.Router();

router.get("/", homeRecipes);

export default router;
