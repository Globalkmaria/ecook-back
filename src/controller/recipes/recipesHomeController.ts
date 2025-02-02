import { NextFunction, Request, Response } from "express";

import { ClientRecipeSimple } from "../../router/v1/recipes/recipes.js";
import { homeRecipesService } from "../../services/recipes/recipesHomeService.js";

export interface HomeRecipe extends ClientRecipeSimple {
  hours: number;
  minutes: number;
  key: string;
  user: { username: string };
}

export const homeRecipes = async (
  req: Request<{}, {}, {}, {}>,
  res: Response<HomeRecipe[]>,
  next: NextFunction
) => {
  try {
    const result = await homeRecipesService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
