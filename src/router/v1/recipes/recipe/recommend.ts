import express from "express";

import { getRecipeRecommend } from "../../../../controllers/recipes/recipe/getRecipeRecommendController";

const router = express.Router();

router.get("/:key/recommend", getRecipeRecommend);

export default router;
