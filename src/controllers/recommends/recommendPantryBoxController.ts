import { NextFunction, Request, Response } from "express";

import { decryptIngredientKeyWithThrowError } from "../../services/ingredients/utils";
import { getOriginalPantryBox } from "../../services/pantry/pantryBoxes/getPantryBox";
import { decryptPantryBoxKeyWithThrowError } from "../../services/pantry/utils";
import { decryptProductKeyWithThrowError } from "../../services/products/utils";
import {
  formatRecipeData,
  getUniqueRecipes,
} from "../../services/recipes/recipe/helper";
import { getRecentRecipes } from "../../services/recipes/recipe/recipeRecommendService";
import { RecipeRecommendationClientData } from "../../services/recipes/recipe/type";
import {
  getIngredientAndProductRecommendRecipes,
  getIngredientRecommendRecipes,
} from "../../services/recommends/recommendPantryBoxService";

type RecommendPantryBoxParams = {
  pantryBoxKey: string;
};

type RecommendPantryBoxParamsQuery = {
  ingredientKey?: string;
  productKey?: string;
};

type RecommendPantryBoxResponse = RecipeRecommendationClientData[];

export const recommendPantryBoxController = async (
  req: Request<RecommendPantryBoxParams, "", "", RecommendPantryBoxParamsQuery>,
  res: Response<RecommendPantryBoxResponse>,
  next: NextFunction
) => {
  try {
    const { pantryBoxKey } = req.params;
    const { ingredientKey, productKey } = req.query;
    let ingredientId = null;
    let productId = null;

    if (!ingredientKey) {
      const pantryBoxId = decryptPantryBoxKeyWithThrowError(pantryBoxKey);
      const pantryBoxInfo = await getOriginalPantryBox(pantryBoxId);
      ingredientId = pantryBoxInfo.ingredient_id;
      productId = pantryBoxInfo.product_id;
    } else {
      ingredientId = decryptIngredientKeyWithThrowError(ingredientKey);
      if (productKey) {
        productId = decryptProductKeyWithThrowError(productKey);
      }
    }

    const result = productId
      ? await getIngredientAndProductRecommendRecipes(ingredientId, productId)
      : await getIngredientRecommendRecipes(ingredientId);

    if (result.length < RECOMMENDATION_LIMIT) {
      const recipes = await getRecentRecipes();
      result.push(...recipes);
    }

    const uniqueRecipes = getUniqueRecipes(result, RECOMMENDATION_LIMIT);
    const formattedRecipes = formatRecipeData(uniqueRecipes);

    return res.json(formattedRecipes);
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error ? error.message : `Something went wrong while `,
    });
  }
};

const RECOMMENDATION_LIMIT = 8;
