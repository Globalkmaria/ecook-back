import express from "express";

import { upload } from "../../../../db/aws";
import { authGuard } from "../../../../middleware/auth";

import { getRecipe } from "../../../../controllers/recipes/recipe/getRecipeController";
import { deleteRecipe } from "../../../../controllers/recipes/recipe/deleteRecipeController";
import { updateRecipe } from "../../../../controllers/recipes/recipe/updateRecipeController";

const router = express.Router();

router.get("/:key", getRecipe);

router.delete("/:key", authGuard, deleteRecipe);

router.put("/:key", authGuard, upload.any(), updateRecipe);

export default router;
