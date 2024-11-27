import express from "express";

import recipesRouter from "./recipes";
import recipeDetailRouter from "./recipe/index";
import productsRouter from "./products";
import usersRouter from "./users";
import authRouter from "./auth";

const router = express.Router();

router.use("/recipes", recipesRouter);

router.use("/recipes", recipeDetailRouter);

router.use("/products", productsRouter);

router.use("/users", usersRouter);

router.use("/auth", authRouter);

export default router;
