import express from "express";
import { getProduct } from "../../../../controllers/products/product/productController.js";

const router = express.Router();

router.get("/:key", getProduct);

export default router;
