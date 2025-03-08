import { NextFunction, Request, Response } from "express";

import { decryptProductKeyWithThrowError } from "../../../services/products/utils";
import { ServiceError } from "../../../services/helpers/ServiceError";
import { getProductDetail } from "../../../services/products/product/productService";

export interface GetProductParams {
  key: string;
}

export const getProduct = async (
  req: Request<GetProductParams, "">,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = decryptProductKeyWithThrowError(req.params.key);

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
