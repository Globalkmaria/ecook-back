import { NextFunction, Request, Response } from "express";

type AddItemToCartParams = {
  username: string;
};

type AddItemToCartBody = {
  ingredientId: string;
  productId?: string;
  quantity: number;
};

type AddItemToCartResponse = {};

export const addItemToCart = async (
  req: Request<AddItemToCartParams, {}, AddItemToCartBody>,
  res: Response<AddItemToCartResponse>,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const { ingredientId, productId, quantity } = req.body;
  } catch (error) {
    next(error);
  }
};
