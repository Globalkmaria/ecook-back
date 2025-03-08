import express from "express";

import productRouter from "./product";
import recommendRouter from "./recommend";

const router = express.Router();

router.use("/", productRouter);
router.use("/", recommendRouter);

export default router;
