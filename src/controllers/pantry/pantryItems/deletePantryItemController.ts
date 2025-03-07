import { NextFunction, Request, Response } from "express";

import { deletePantryItem } from "../../../services/pantry/pantryItems/deletePantryItem.js";
import { decryptPantryItemKeyWithThrowError } from "../../../services/pantry/utils.js";
import { SerializedUser } from "../../../config/passport.js";

type DeletePantryItemParams = {
  pantryItemKey: string;
};

export const deletePantryItemController = async (
  req: Request<DeletePantryItemParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pantryItemKey } = req.params;
    const user = req.user as SerializedUser;
    const pantryItemId = decryptPantryItemKeyWithThrowError(pantryItemKey);

    await deletePantryItem(pantryItemId, user.id);

    res.status(204).send();
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
