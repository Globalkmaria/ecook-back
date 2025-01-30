import express from "express";

import productRouter from "./product.js";

const router = express.Router();

router.use("/", productRouter);

export default router;
