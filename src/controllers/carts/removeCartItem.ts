import { NextFunction, Request, Response } from "express";

type RemoveCartItemParams = {
  id: string;
};

type RemoveCartItemResponse = {};

export const removeCartItem = async (
  req: Request<RemoveCartItemParams, {}>,
  res: Response<RemoveCartItemResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
  } catch (error) {
    next(error);
  }
};
