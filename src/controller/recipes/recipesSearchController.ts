import { NextFunction, Request, Response } from "express";

import { searchRecipesService } from "../../services/recipes/recipesSearchService.js";
import { ClientRecipeSimple } from "../../router/v1/recipes/recipes.js";

export interface SearchRecipesQueryParams {
  q?: string;
  type?: string;
}

export const SEARCH_TYPES = {
  NAME: "name",
  TAG: "tag",
  INGREDIENT: "ingredient",
  PRODUCT: "product",
  USERNAME: "username",
};

const SEARCH_TYPES_VALUES = Object.values(SEARCH_TYPES);

export const searchRecipes = async (
  req: Request<{}, {}, {}, SearchRecipesQueryParams>,
  res: Response<ClientRecipeSimple[] | { error: string }>,
  next: NextFunction
) => {
  try {
    const { q, type } = req.query as SearchRecipesQueryParams;

    if (type && !SEARCH_TYPES_VALUES.includes(type)) {
      return res.status(400).json({ error: "Invalid search type" });
    }

    const result = await searchRecipesService({ q, type });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }

    next(error);
  }
};
