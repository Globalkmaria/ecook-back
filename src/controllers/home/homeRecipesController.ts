import { NextFunction, Request, Response } from "express";

import { homeRecipesService } from "../../services/home/homeRecipesService.js";
import { ClientRecipeSimple } from "../../services/recipes/type.js";

export interface HomeRecipe extends ClientRecipeSimple {
  hours: number;
  minutes: number;
  key: string;
  user: { username: string };
}

type HomeRecipeResponse = HomeRecipe[] | { error: string };

export const homeRecipes = async (
  req: Request,
  res: Response<HomeRecipeResponse>,
  next: NextFunction
) => {
  try {
    const result = await homeRecipesService();
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      next({
        status: 400,
        message: error.message,
        error,
      });
    }
    next(error);
  }
};
