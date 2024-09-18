import express from "express";

import recipesRouter from "./recipes";
import recipeDetailRouter from "./recipe/index";
import productsRouter from "./products";

const router = express.Router();

router.use("/recipes", recipesRouter);
router.use("/recipes", recipeDetailRouter);

router.use("/products", productsRouter);
export default router;
