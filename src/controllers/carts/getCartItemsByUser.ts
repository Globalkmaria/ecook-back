import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport";
import { ServiceError } from "../../services/helpers/ServiceError";
import { getCartItemsByUserIdService } from "../../services/carts/getCartItemsByUserIdService";
import { CartItemInfo } from "../../services/carts/type";
import { generateClientCartItems } from "../../services/carts/helper";

type GetCartItemsByUserParams = {
  username: string;
};

export type GetCartItemsByUserResponse = {
  items: CartItemInfo[];
};

export const getCartItemsByUser = async (
  req: Request<GetCartItemsByUserParams>,
  res: Response<GetCartItemsByUserResponse>,
  next: NextFunction
) => {
  const { username } = req.params;
  const user = req.user as SerializedUser;
  if (username !== user.username) throw new ServiceError(403, "Forbidden");

  try {
    const cartItems = await getCartItemsByUserIdService(user.id);
    const response = generateClientCartItems(cartItems);
    res.json({ items: response });
  } catch (error) {
    if (error instanceof ServiceError) {
      next({ status: error.status, message: error.message });
      return;
    }

    next({
      status: 400,
      message: "Error getting cart items",
      error,
    });
  }
};
