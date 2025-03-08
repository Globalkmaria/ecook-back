import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "../../services/carts/cartsService";
import { ServiceError } from "../../services/helpers/ServiceError";

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
  req: Request<UpdateCartItemParams, "", UpdateCartItemBody>,
  res: Response<UpdateCartItemResponse>,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const { quantity, ingredientKey, productKey } = req.body;

    const user = req.user as SerializedUser;
    if (username !== user.username) throw new ServiceError(403, "Forbidden");

    let count = 0;
    if (quantity <= 0) {
      await removeCartItem({
        userId: user.id,
        ingredientKey,
        productKey,
      });
      count = 0;
    } else {
      count = await updateCartItemQuantity({
        userId: user.id,
        ingredientKey,
        productKey,
        quantity,
      });
    }

    res.json({ count });
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
