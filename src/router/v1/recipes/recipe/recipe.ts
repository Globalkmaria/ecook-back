import express from "express";

import { upload } from "../../../../db/aws.js";
import { authGuard } from "../../../../middleware/auth.js";

import { getRecipe } from "../../../../controllers/recipes/recipe/getRecipeController.js";
import { deleteRecipe } from "../../../../controllers/recipes/recipe/deleteRecipeController.js";
import { updateRecipe } from "../../../../controllers/recipes/recipe/updateRecipeController.js";

const router = express.Router();

router.get("/:key", getRecipe);

router.delete("/:key", authGuard, deleteRecipe);

router.put("/:key", authGuard, upload.any(), updateRecipe);

export default router;
