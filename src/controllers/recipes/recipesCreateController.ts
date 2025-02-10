import { NextFunction, Request, Response } from "express";

import { createRecipeService } from "../../services/recipes/recipesCreateService/index.js";

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
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
    next(error);
  }
};
