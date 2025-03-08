import { NextFunction, Request, Response } from "express";

import { createRecipeService } from "../../services/recipes/recipesCreateService/index";
import { ServiceError } from "../../services/helpers/ServiceError";

export interface CreateRecipeBody {
  info: string; // JSON string
}

export const createRecipe = async (
  req: Request<{}, {}, CreateRecipeBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createRecipeService(req);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      next({
        status: error.status,
        message: error.message,
        error: error,
      });
    }

    next({
      status: 400,
      message: "Error creating recipe",
      error: error,
    });
  }
};
