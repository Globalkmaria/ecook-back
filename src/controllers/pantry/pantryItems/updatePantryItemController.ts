import { NextFunction, Request, Response } from "express";

import { decryptPantryItemKeyWithThrowError } from "../../../services/pantry/utils.js";
import { updatePantryItem } from "../../../services/pantry/pantryItems/updatePantryItem.js";
import { SerializedUser } from "../../../config/passport.js";

type UpdatePantryItemParams = {
  pantryItemKey: string;
};

type UpdatePantryItemRequestBody = {
  name: string;
  value: string;
};

export const updatePantryItemController = async (
  req: Request<UpdatePantryItemParams, {}, UpdatePantryItemRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const { pantryItemKey } = req.params;
    const { name, value } = req.body;

    const pantryItemId = decryptPantryItemKeyWithThrowError(pantryItemKey);

    await updatePantryItem({ pantryItemId, name, value, userId: user.id });

    res.status(200).send();
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the pantry item.",
      error,
    });
  }
};
