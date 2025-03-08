import express from "express";

import recipeRouter from "./recipe/index";
import recipesRouter from "./recipes";

const router = express.Router();

router.use("/", recipesRouter);
router.use("/", recipeRouter);

export default router;
