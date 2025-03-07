import { NextFunction, Request, Response } from "express";

import {
  formatRecipeData,
  getUniqueRecipes,
} from "../../../services/recipes/recipe/helper";
import {
  getIngredientRecipes,
  getRecentRecipes,
  getRecipeInfo,
  getTagRecipes,
  getUserRecipes,
} from "../../../services/recipes/recipe/recipeRecommendService";
import { RecommendRecipe } from "../../../services/recommends/type";

type GetRecipeRecommendParams = {
  key: string;
};

export const getRecipeRecommend = async (
  req: Request<GetRecipeRecommendParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipe = await getRecipeInfo(req.params.key);

    const result: RecommendRecipe[] = [];

    const userRecipes = await getUserRecipes(recipe);
    result.push(...userRecipes);

    const ingredientRecipes = await getIngredientRecipes(recipe);
    result.push(...ingredientRecipes);

    const tagRecipes = await getTagRecipes(recipe);
    result.push(...tagRecipes);

    if (result.length < 8) {
      const recipes = await getRecentRecipes();
      result.push(...recipes);
    }

    const uniqueRecipes = getUniqueRecipes(result, 8);
    const formattedRecipes = formatRecipeData(uniqueRecipes);
    res.status(200).json(formattedRecipes);
  } catch (error) {
    next(error);
  }
};
