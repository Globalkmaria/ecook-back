import express from "express";
import { RowDataPacket } from "mysql2";

import { upload } from "../../../db/aws.js";
import { authGuard } from "../../../middleware/auth.js";
import { searchRecipes } from "../../../controllers/recipes/recipesSearchController.js";
import { createRecipe } from "../../../controllers/recipes/recipesCreateController.js";

const router = express.Router();

export interface RecipesSimple extends RowDataPacket {
  id: number; // Non-nullable, int, default 0
  name: string; // Non-nullable, varchar(50)
  created_at: Date; // Timestamp for when the record was created
  updated_at: Date; // Timestamp for when the record was updated
  img: string; // Non-nullable, varchar(255)
  user_img?: string | null; // Nullable, varchar(255)
  user_username: string; //  varchar(100)
  user_id: number; // Non-nullable, int, default 0
  tag_ids?: string | null; // Nullable, text (could store a list of tag IDs as a string)
  tag_names?: string | null; // Nullable, text (could store a list of tag names as a string)
  hours: number; // Non-nullable, int, default 0
  minutes: number; // Non-nullable, int, default 0
}

export interface ClientRecipeSimple {
  id: number;
  name: string;
  img: string;
  tags: { id: number; name: string }[];
}

/**
 * @route GET /api/recipes
 * @desc  Search recipes by name, tag, ingredient, product, or username
 * @access Public
 */

router.get("/", searchRecipes);

// ---
export interface IngredientNewProduct {
  name: string;
  brand: string | null;
  purchasedFrom: string | null;
  link: string | null;
  img: File | null;
  id: string | null;
}

interface NewRecipeIngredient {
  name: string;
  quantity: string;
  ingredientId: number | null;
  productId: number | null;
  newProduct: IngredientNewProduct | null;
}

export interface INewRecipe {
  name: string;
  description: string;
  hours: number;
  minutes: number;
  steps: string[];
  ingredients: NewRecipeIngredient[];
  tags: string[];
}

router.post("/", authGuard, upload.any(), createRecipe);

export default router;
