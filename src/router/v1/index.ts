import express from "express";

import recipesRouter from "./recipes";
import recipeDetailRouter from "./recipe/index";

const router = express.Router();

router.use("/recipes", recipesRouter);
router.use("/recipes", recipeDetailRouter);

export default router;
