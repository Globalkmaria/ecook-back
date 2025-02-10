import express from "express";
import { homeRecipes } from "../../../controllers/recipes/recipesHomeController.js";

const router = express.Router();

router.get("/", homeRecipes);

export default router;
