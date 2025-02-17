import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport.js";
import { ServiceError } from "../../services/helpers/ServiceError.js";
import { createCartItem } from "../../services/carts/cartsService.js";

type AddItemToCartParams = {
  username: string;
};

type AddItemToCartBody = {
  ingredientKey: string;
  productKey?: string;
};

type AddItemToCartResponse = {
  count: number;
};

export const addItemToCart = async (
  req: Request<AddItemToCartParams, {}, AddItemToCartBody>,
  res: Response<AddItemToCartResponse>,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const user = req.user as SerializedUser;
    if (username !== user.username) throw new ServiceError(403, "Forbidden");

    const { ingredientKey, productKey } = req.body;

    const count = await createCartItem({
      userId: user.id,
      ingredientKey,
      productKey,
    });

    res.json({ count });
  } catch (error) {
    if (error instanceof ServiceError) {
      next({ status: error.status, message: error.message, error });
      return;
    }

    next({
      status: 400,
      message: "Error creating cart item",
      error,
    });
  }
};
