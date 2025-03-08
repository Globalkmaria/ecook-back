import { NextFunction, Request, Response } from "express";

import { ClientRecipeSimple } from "../../services/recipes/type";
import { ServiceError } from "../../services/helpers/ServiceError";
import { getBatchRecipes } from "../../services/recipes/recipesBatchService";

export type RecipesBatchBody = {
  type: string;
  query: string[];
};

type RecipesBatchResponse = {
  search: ClientRecipeSimple[];
  recommend: ClientRecipeSimple[];
};

export const RECIPES_BATCH_SEARCH_TYPES = {
  KEYS: "keys",
} as const;

const RECIPES_BATCH_SEARCH_TYPE_VALUES = Object.values(
  RECIPES_BATCH_SEARCH_TYPES
);

export type RecipesBatchSearchTypes =
  (typeof RECIPES_BATCH_SEARCH_TYPES)[keyof typeof RECIPES_BATCH_SEARCH_TYPES];

export const recipesBatch = async (
  req: Request<"", "", RecipesBatchBody>,
  res: Response<RecipesBatchResponse>,
  next: NextFunction
) => {
  try {
    const type = req.body.type as RecipesBatchSearchTypes;
    if (!RECIPES_BATCH_SEARCH_TYPE_VALUES.includes(type)) {
      next({
        status: 400,
        message: "Invalid search type",
      });
      return;
    }

    const query = req.body.query;
    if (!query) {
      next({
        status: 400,
        message: "Invalid search query",
      });
      return;
    }

    const search = await getBatchRecipes({ query, type });

    res.status(200).json({
      search,
      recommend: [],
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      next({
        status: error.status,
        message: error.message,
        error,
      });
    }
    if (error instanceof Error) {
      next({
        status: 400,
        message: "Something went wrong while searching for recipes",
        error,
      });
    }
    next(error);
  }
};
