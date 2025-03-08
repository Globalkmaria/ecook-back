import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../../config/passport";
import { deletePantryItem } from "../../../services/pantry/pantryItems/deletePantryItem";
import { decryptPantryItemKeyWithThrowError } from "../../../services/pantry/utils";

type DeletePantryItemParams = {
  pantryItemKey: string;
};

type DeletePantryItemResponse = {
  pantryBoxDeleted: boolean;
};

export const deletePantryItemController = async (
  req: Request<DeletePantryItemParams>,
  res: Response<DeletePantryItemResponse>,
  next: NextFunction
) => {
  try {
    const { pantryItemKey } = req.params;
    const user = req.user as SerializedUser;
    const pantryItemId = decryptPantryItemKeyWithThrowError(pantryItemKey);

    const result = await deletePantryItem(pantryItemId, user.id);

    res.json(result);
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the pantry item.",
      error,
    });
  }
};
