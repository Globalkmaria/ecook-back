import { NextFunction, Request, Response } from "express";
import { decryptPantryBoxKeyWithThrowError } from "../../services/pantry/utils.js";
import { getOriginalPantryBox } from "../../services/pantry/pantryBoxes/getPantryBox.js";
import {
  getIngredientAndProductRecommendRecipes,
  getIngredientRecommendRecipes,
} from "../../services/recommends/recommendPantryBoxService.js";
import {
  formatRecipeData,
  getUniqueRecipes,
} from "../../services/recipes/recipe/helper.js";
import { getRecentRecipes } from "../../services/recipes/recipe/recipeRecommendService.js";
import { RecipeRecommendationClientData } from "../../services/recipes/recipe/type.js";

type RecommendPantryBoxParams = {
  pantryBoxKey: string;
};

type RecommendPantryBoxResponse = RecipeRecommendationClientData[];

export const recommendPantryBoxController = async (
  req: Request<RecommendPantryBoxParams>,
  res: Response<RecommendPantryBoxResponse>,
  next: NextFunction
) => {
  try {
    const { pantryBoxKey } = req.params;
    const pantryBoxId = decryptPantryBoxKeyWithThrowError(pantryBoxKey);
    const pantryBoxInfo = await getOriginalPantryBox(pantryBoxId);
    const result = pantryBoxInfo.product_id
      ? await getIngredientAndProductRecommendRecipes(
          pantryBoxInfo.ingredient_id,
          pantryBoxInfo.product_id
        )
      : await getIngredientRecommendRecipes(pantryBoxInfo.ingredient_id);

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
