import express from "express";

import recipesRouter from "./recipes";
import recipeDetailRouter from "./recipe/index";
import productsRouter from "./products";
import usersRouter from "./users";

const router = express.Router();

router.use("/recipes", recipesRouter);

router.use("/recipes", recipeDetailRouter);

router.use("/products", productsRouter);

router.use("/users", usersRouter);

export default router;
