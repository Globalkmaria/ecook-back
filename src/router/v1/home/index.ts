import express from "express";
import { homeRecipes } from "../../../controller/recipes/recipesHomeController";

const router = express.Router();

router.get("/", homeRecipes);

export default router;
