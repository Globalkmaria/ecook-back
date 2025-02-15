import express from "express";

import recipesRouter from "./recipes.js";
import recipeRouter from "./recipe/index.js";

const router = express.Router();

router.use("/", recipesRouter);
router.use("/", recipeRouter);

export default router;
