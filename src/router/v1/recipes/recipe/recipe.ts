import express from "express";

import { deleteRecipe } from "../../../../controllers/recipes/recipe/deleteRecipeController";
import { getRecipe } from "../../../../controllers/recipes/recipe/getRecipeController";
import { updateRecipe } from "../../../../controllers/recipes/recipe/updateRecipeController";
import { upload } from "../../../../db/aws";
import { authGuard } from "../../../../middleware/auth";


const router = express.Router();

router.get("/:key", getRecipe);

router.delete("/:key", authGuard, deleteRecipe);

router.put("/:key", authGuard, upload.any(), updateRecipe);

export default router;
