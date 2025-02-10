import express from "express";

import { getProductRecommendation } from "../../../../controllers/products/product/productRecommendController.js";

const router = express.Router();

router.get("/:key/recommend", getProductRecommendation);

export default router;
