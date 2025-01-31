import express from "express";

import productsRouter from "./products.js";
import productRouter from "./product/index.js";

const router = express.Router();

router.use("/", productsRouter);
router.use("/", productRouter);

export default router;
