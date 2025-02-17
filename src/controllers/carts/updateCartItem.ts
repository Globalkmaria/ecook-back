import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport.js";
import { ServiceError } from "../../services/helpers/ServiceError.js";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "../../services/carts/cartsService.js";

type UpdateCartItemParams = {
  username: string;
};

type UpdateCartItemBody = {
  ingredientKey?: string;
  productKey?: string;
  quantity: number;
};

type UpdateCartItemResponse = {
  count: number;
};

export const updateCartItem = async (
  req: Request<UpdateCartItemParams, {}, UpdateCartItemBody>,
  res: Response<UpdateCartItemResponse>,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const { quantity, ingredientKey, productKey } = req.body;

    const user = req.user as SerializedUser;
    if (username !== user.username) throw new ServiceError(403, "Forbidden");

    let result;
    if (quantity <= 0) {
      result = removeCartItem({
        userId: user.id,
        ingredientKey,
        productKey,
      });
    } else {
      result = updateCartItemQuantity({
        userId: user.id,
        ingredientKey,
        productKey,
        quantity,
      });
    }

    res.status(200).send();
  } catch (error) {
    if (error instanceof ServiceError) {
      next({ status: error.status, message: error.message });
      return;
    }
    next({
      status: 400,
      message: "Error updating cart item",
      error,
    });
  }
};
