import { NextFunction, Request, Response } from "express";

import { HomeRecommendRecipe } from "../../router/v1/recommend/type.js";
import {
  getIngredientRecommend,
  getTagRecommend,
} from "../../services/recommends/recommendHomeService.js";

type RecommendHomeResponse = {
  [K in (typeof recommendType)[number]]: {
    [typeOption: string]: HomeRecommendRecipe[];
  };
};

const recommendType = ["tag", "ingredient"];

export const recommendHome = async (
  req: Request,
  res: Response<RecommendHomeResponse>,
  next: NextFunction
) => {
  try {
    const tagRecipes = await getTagRecommend();
    const ingredientRecipes = await getIngredientRecommend();

    res.status(200).json({
      tag: tagRecipes,
      ingredient: ingredientRecipes,
    });
  } catch (error) {
    next(error);
  }
};
