import express from "express";

import recipeRouter from "./recipe.js";
import recommendRouter from "./recommend.js";

const router = express.Router();

router.use("/", recipeRouter);
router.use("/", recommendRouter);

export default router;
