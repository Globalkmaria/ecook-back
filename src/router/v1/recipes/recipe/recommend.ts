import express from "express";

import { getRecipeRecommend } from "../../../../controllers/recipes/recipe/getRecipeRecommendController.js";

const router = express.Router();

router.get("/:key/recommend", getRecipeRecommend);

export default router;
