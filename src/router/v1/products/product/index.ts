import express from "express";

import productRouter from "./product.js";
import recommendRouter from "./recommend.js";

const router = express.Router();

router.use("/", productRouter);
router.use("/", recommendRouter);

export default router;
