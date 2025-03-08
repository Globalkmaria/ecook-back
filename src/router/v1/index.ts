import express from "express";

import recipesRouter from "./recipes/index";
import productsRouter from "./products/index";
import usersRouter from "./users";
import authRouter from "./auth/index";
import imagesRouter from "./images/index";
import recommendRouter from "./recommend/index";
import bookmarksRouter from "./bookmarks/index";
import homeRouter from "./home/index";
import cartsRouter from "./carts/index";
import ingredientsRouter from "./ingredients/index";
import pantryRouter from "./pantry/index";

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
router.use("/pantry", pantryRouter);

export default router;
