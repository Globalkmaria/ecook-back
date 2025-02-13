import express from "express";

import { upload } from "../../../db/aws.js";
import { authGuard } from "../../../middleware/auth.js";
import { searchRecipes } from "../../../controllers/recipes/recipesSearchController.js";
import { createRecipe } from "../../../controllers/recipes/recipesCreateController.js";

const router = express.Router();

/**
 * @route GET /api/recipes
 * @desc  Search recipes by name, tag, ingredient, product, or username
 * @access Public
 */
router.get("/", searchRecipes);

router.post("/", authGuard, upload.any(), createRecipe);

export default router;
