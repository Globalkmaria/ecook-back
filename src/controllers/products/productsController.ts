import { NextFunction, Request, Response } from "express";

import { searchProducts } from "../../services/products/productsService.js";
import { isValidProductQueryType } from "./helper.js";
import { GetProductsQuery, GetProductsResponse } from "./type.js";

export const getProducts = async (
  req: Request<{}, {}, {}, GetProductsQuery>,
  res: Response<GetProductsResponse>,
  next: NextFunction
) => {
  try {
    const { type, q } = req.query;

    if (!q.trim()) {
      next({
        status: 400,
        message: "Invalid query",
      });
      return;
    }

    if (!isValidProductQueryType(type)) {
      next({
        status: 400,
        message: "Invalid query type",
      });
      return;
    }

    const { products, ingredientId } = await searchProducts({ type, query: q });

    res.json({
      ingredientId,
      products,
    });
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error ? error.message : "Error fetching products",
      error,
    });
  }
};
