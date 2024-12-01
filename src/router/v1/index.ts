import express from "express";

import recipesRouter from "./recipes.js";
import recipeDetailRouter from "./recipe/index.js";
import productsRouter from "./products.js";
import usersRouter from "./users.js";
import authRouter from "./auth/index.js";

const router = express.Router();

router.use("/recipes", recipesRouter);
router.use("/recipes", recipeDetailRouter);
router.use("/products", productsRouter);
router.use("/users", usersRouter);
router.use("/auth", authRouter);

export default router;
