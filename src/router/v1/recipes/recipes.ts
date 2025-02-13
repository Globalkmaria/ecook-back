import express from "express";

import { upload } from "../../../db/aws.js";
import { authGuard } from "../../../middleware/auth.js";
import { searchRecipes } from "../../../controllers/recipes/recipesSearchController.js";
import { createRecipe } from "../../../controllers/recipes/recipesCreateController.js";
import { recipesBatch } from "../../../controllers/recipes/recipesBatchController.js";

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
