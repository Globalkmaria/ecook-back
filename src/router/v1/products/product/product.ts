import express from "express";
import { getProduct } from "../../../../controllers/products/product/productController";

const router = express.Router();

router.get("/", getProduct);

export default router;
