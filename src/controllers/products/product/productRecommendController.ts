import { NextFunction, Request, Response } from "express";

import { decryptRecipeURLAndGetProductId } from "../../../services/products/helper.js";
import { validateId } from "../../../utils/numbers.js";
import { getProductRecommendService } from "../../../services/products/product/productRecommendService.js";
import { ServiceError } from "../../../services/helpers/ServiceError.js";

export interface GetProductRecommendParams {
  key: string;
}

export const getProductRecommendation = async (
  req: Request<GetProductRecommendParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = decryptRecipeURLAndGetProductId(req.params.key);

    if (!productId || !validateId(productId))
      throw new ServiceError(400, "Invalid key");

    const result = await getProductRecommendService(productId);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      next({ status: error.status, message: error.message });
      return;
    }
    next(error);
  }
};
