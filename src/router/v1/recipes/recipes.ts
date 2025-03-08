import express from "express";

import { recipesBatch } from "../../../controllers/recipes/recipesBatchController";
import { createRecipe } from "../../../controllers/recipes/recipesCreateController";
import { searchRecipes } from "../../../controllers/recipes/recipesSearchController";
import { upload } from "../../../db/aws";
import { authGuard } from "../../../middleware/auth";

const router = express.Router();

/**
 * @route GET /api/recipes
 * @desc  Search recipes by name, tag, ingredient, product or username
 */
router.get("/", searchRecipes);

/**
 * @route POST /api/recipes/batch
 * @desc  Search recipes by keys
 */

router.post("/batch", recipesBatch);

router.post("/", authGuard, upload.any(), createRecipe);

export default router;
