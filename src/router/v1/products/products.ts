import express from "express";

import { getProducts } from "../../../controllers/products/productsController";

const router = express.Router();

router.get("/", getProducts);

export default router;
