import { NextFunction, Request, Response } from "express";

import { HomeRecommendRecipe } from "../../services/recommends/type";
import {
  getIngredientRecommend,
  getTagRecommend,
} from "../../services/recommends/recommendHomeService";

export interface HomeRecommendationSection {
  recipes: { [typeOption: string]: HomeRecommendRecipe[] };
  order: string[];
}

type RecommendHomeResponse = {
  [K in (typeof recommendType)[number]]: HomeRecommendationSection;
};

const recommendType = ["tag", "ingredient"] as const;

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
      ingredient: {
        recipes: ingredientRecipes.recipes,
        order: ingredientRecipes.order,
      },
    });
  } catch (error) {
    next(error);
  }
};
