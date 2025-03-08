import express from "express";

import recipeRouter from "./recipe";
import recommendRouter from "./recommend";

const router = express.Router();

router.use("/", recipeRouter);
router.use("/", recommendRouter);

export default router;
