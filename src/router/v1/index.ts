import express from "express";

import recipesRouter from "./recipes/index.js";
import productsRouter from "./products/index.js";
import usersRouter from "./users.js";
import authRouter from "./auth/index.js";
import imagesRouter from "./images/index.js";
import recommendRouter from "./recommend/index.js";
import bookmarksRouter from "./bookmarks/index.js";
import homeRouter from "./home/index.js";
import cartsRouter from "./carts/index.js";
import ingredientsRouter from "./ingredients/index.js";

const router = express.Router();

router.use("/images", imagesRouter);
router.use("/recipes", recipesRouter);
router.use("/home", homeRouter);
router.use("/products", productsRouter);
router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/recommend", recommendRouter);
router.use("/bookmarks", bookmarksRouter);
router.use("/ingredients", ingredientsRouter);
router.use("/carts", cartsRouter);

export default router;
