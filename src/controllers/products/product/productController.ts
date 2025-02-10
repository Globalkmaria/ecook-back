import { NextFunction, Request, Response } from "express";

import { decryptRecipeURLAndGetProductId } from "../../../services/products/helper.js";
import { validateId } from "../../../utils/numbers.js";
import { ServiceError } from "../../../services/helpers/ServiceError.js";
import { getProductDetail } from "../../../services/products/product/productService.js";

export interface GetProductParams {
  key: string;
}

export const getProduct = async (
  req: Request<GetProductParams, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = decryptRecipeURLAndGetProductId(req.params.key);

    if (!productId || !validateId(productId))
      throw new ServiceError(400, "Invalid key");

    const product = await getProductDetail(productId);

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof ServiceError) {
      next({
        status: error.status,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};
