import express from "express";

import productRouter from "./product/index";
import productsRouter from "./products";

const router = express.Router();

router.use("/", productsRouter);
router.use("/", productRouter);

export default router;
