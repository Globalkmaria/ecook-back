import express from "express";

import recipesRouter from "./recipes";
import recipeRouter from "./recipe/index";

const router = express.Router();

router.use("/", recipesRouter);
router.use("/", recipeRouter);

export default router;
