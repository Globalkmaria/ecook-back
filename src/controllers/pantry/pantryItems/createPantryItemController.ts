import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../../config/passport";
import { createPantryItem } from "../../../services/pantry/pantryItems/createPantryItem";
import {
  decryptPantryBoxKeyWithThrowError,
  generatePantryItemKey,
} from "../../../services/pantry/utils";

export type CreatePantryItemParams = {
  pantryBoxKey: string;
};

export type CreatePantryItemRequestBody = {
  buyDate: string;
  expireDate: string;
  quantity: number;
};

export type CreatePantryItemResponse = {
  pantryItemKey: string;
};

export const createPantryItemController = async (
  req: Request<CreatePantryItemParams, "", CreatePantryItemRequestBody>,
  res: Response<CreatePantryItemResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const { pantryBoxKey } = req.params;
    const pantryBoxId = decryptPantryBoxKeyWithThrowError(pantryBoxKey);

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
