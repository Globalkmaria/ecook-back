import { NextFunction, Request, Response } from "express";

import { ServiceError } from "../../services/helpers/ServiceError.js";

import { mapQueryResultToBatchResponse } from "../../services/ingredients/helper.js";
import { extractIngredientAndProductIds } from "../../services/ingredients/utils.js";
import {
  getIngredients,
  getProducts,
} from "../../services/ingredients/ingredientsBatchService.js";

export type IngredientsBatchBody = {
  items: {
    [ingredientKey: string]: {
      productKeys?: string[];
    };
  };
};

type IngredientsBatchItem = {
  ingredient: {
    name: string;
    key: string;
  };
  products: {
    [productKey: string]: {
      name: string;
      brand: string;
      purchasedFrom: string;
      img: string;
      key: string;
    };
  };
};

export type IngredientsBatchResponse = {
  [ingredientKey: string]: IngredientsBatchItem;
};

export const ingredientsBatch = async (
  req: Request<{}, {}, IngredientsBatchBody>,
  res: Response<IngredientsBatchResponse>,
  next: NextFunction
) => {
  try {
    const { items } = req.body;

    const ingredientKeys = Object.keys(items);
    if (ingredientKeys.length === 0) {
      next({
        status: 400,
        message: "Invalid ingredient keys",
      });
      return;
    }
    const { ingredientIds, productIds } = extractIngredientAndProductIds(items);

    const ingredients = await getIngredients(ingredientIds);
    const products = productIds.length ? await getProducts(productIds) : [];

    const result = mapQueryResultToBatchResponse({ ingredients, products });

    res.status(200).json(result);
  } catch (error) {
    const status = error instanceof ServiceError ? error.status : 400;
    const message =
      error instanceof ServiceError
        ? error.message
        : "Something went wrong while fetching ingredients.";

    next({
      status,
      message,
      error,
    });
  }
};
