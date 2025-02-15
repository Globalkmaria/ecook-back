import { NextFunction, Request, Response } from "express";

type GetCartItemsByUserParams = {
  userId: string;
};

type GetCartItemsByUserResponse = {};

export const getCartItemsByUser = async (
  req: Request<GetCartItemsByUserParams>,
  res: Response<GetCartItemsByUserResponse>,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};
