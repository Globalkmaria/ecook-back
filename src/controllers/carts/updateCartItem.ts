import { NextFunction, Request, Response } from "express";

type UpdateCartItemParams = {
  username: string;
};

type UpdateCartItemBody = {
  quantity: number;
};

type UpdateCartItemResponse = {};

export const updateCartItem = async (
  req: Request<UpdateCartItemParams, {}, UpdateCartItemBody>,
  res: Response<UpdateCartItemResponse>,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const { quantity } = req.body;
  } catch (error) {
    next(error);
  }
};
