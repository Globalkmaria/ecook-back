import { NextFunction, Request, Response } from "express";

import { ServiceError } from "../../../services/helpers/ServiceError";
import { getProductRecommendService } from "../../../services/products/product/productRecommendService";
import { decryptProductKeyWithThrowError } from "../../../services/products/utils";

export interface GetProductRecommendParams {
  key: string;
}

export const getProductRecommendation = async (
  req: Request<GetProductRecommendParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = decryptProductKeyWithThrowError(req.params.key);

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
