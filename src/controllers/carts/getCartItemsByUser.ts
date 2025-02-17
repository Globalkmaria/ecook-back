import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport.js";
import { ServiceError } from "../../services/helpers/ServiceError.js";
import { getCartItemsByUserIdService } from "../../services/carts/getCartItemsByUserIdService.js";
import { CartItemInfo } from "../../services/carts/type.js";
import { generateClientCartItems } from "../../services/carts/helper.js";

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
    next({
      status: 400,
      message: "Error getting cart items",
      error,
    });
  }
};
