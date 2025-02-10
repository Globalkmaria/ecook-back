import express from "express";

import productRouter from "./product.js";
import recommendRouter from "./recommend.js";

const router = express.Router();

router.use("/:key", productRouter);
router.use("/:key/recommend", recommendRouter);

export default router;
