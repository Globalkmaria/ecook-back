import express from "express";

import cartsRouter from "./carts";

const router = express.Router();

router.use("/", cartsRouter);

export default router;
