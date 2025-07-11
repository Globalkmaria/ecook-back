import { NextFunction, Request, Response } from "express";

import {
  recommendRecipes,
  searchRecipesService,
} from "../../services/recipes/recipesSearchService";
import { ClientRecipeSimple } from "../../services/recipes/type";

export interface SearchRecipesQueryParams {
  q?: string;
  type?: string;
}

interface SearchRecipesResponse {
  search: ClientRecipeSimple[];
  recommend: ClientRecipeSimple[];
}

export const RECIPES_SEARCH_TYPES = {
  NAME: "name",
  TAG: "tag",
  INGREDIENT: "ingredient",
  PRODUCT: "product",
  USERNAME: "username",
};

const SEARCH_TYPES_VALUES = Object.values(RECIPES_SEARCH_TYPES);

export const searchRecipes = async (
  req: Request<unknown, unknown, unknown, SearchRecipesQueryParams>,
  res: Response<SearchRecipesResponse | { error: string }>,
  next: NextFunction
) => {
  try {
    const { q, type } = req.query as SearchRecipesQueryParams;

    if (type && !SEARCH_TYPES_VALUES.includes(type)) {
      return res.status(400).json({ error: "Invalid search type" });
    }

    const searchResult = await searchRecipesService({ q, type });
    if (searchResult.length) {
      res.status(200).json({ search: searchResult, recommend: [] });
      return;
    }

    const recommend = await recommendRecipes();
    res.status(200).json({ search: [], recommend });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }

    next(error);
  }
};
