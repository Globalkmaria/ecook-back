import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../../config/passport.js";
import { createPantryItem } from "../../../services/pantry/pantryItems/createPantryItem.js";
import {
  decryptPantryBoxKeyWithThrowError,
  generatePantryItemKey,
} from "../../../services/pantry/utils.js";

export type CreatePantryItemRequestBody = {
  pantryBoxKey: string;
  buyDate: string;
  expirationDate: string;
  quantity: number;
};

export type CreatePantryItemResponse = {
  pantryItemKey: string;
};

export const createPantryItemController = async (
  req: Request<{}, {}, CreatePantryItemRequestBody, {}>,
  res: Response<CreatePantryItemResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const pantryBoxId = decryptPantryBoxKeyWithThrowError(
      req.body.pantryBoxKey
    );

    const pantryId = await createPantryItem({
      userId: user.id,
      ...req.body,
      pantryBoxId,
    });

    const pantryItemKey = generatePantryItemKey(pantryId);

    res.json({
      pantryItemKey,
    });
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the pantry item.",
      error,
    });
  }
};
