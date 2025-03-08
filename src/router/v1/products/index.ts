import express from "express";

import productsRouter from "./products";
import productRouter from "./product/index";

const router = express.Router();

router.use("/", productsRouter);
router.use("/", productRouter);

export default router;
