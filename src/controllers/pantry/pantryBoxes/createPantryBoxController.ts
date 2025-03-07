import { NextFunction, Request, Response } from "express";

import { createPantryBox } from "../../../services/pantry/pantryBoxes/createPantryBox.js";
import { SerializedUser } from "../../../config/passport.js";
import { decryptIngredientKeyWithThrowError } from "../../../services/ingredients/utils.js";
import { decryptProductKeyWithThrowError } from "../../../services/products/utils.js";
import { createPantryItem } from "../../../services/pantry/pantryItems/createPantryItem.js";
import { generatePantryBoxKey } from "../../../services/pantry/utils.js";

type CreatePantryBoxRequestBody = {
  pantryBox: {
    ingredientKey: string;
    productKey: string;
  };
  pantryItem: {
    quantity: number;
    buyDate: string;
    expireDate: string;
  };
};

type CreatePantryBoxResponse = {
  pantryBoxKey: string;
};

export const createPantryBoxController = async (
  req: Request<{}, {}, CreatePantryBoxRequestBody>,
  res: Response<CreatePantryBoxResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const pantryBoxId = await createPantryBox({
      userId: user.id,
      ingredientId: decryptIngredientKeyWithThrowError(
        req.body.pantryBox.ingredientKey
      ),
      productId: decryptProductKeyWithThrowError(req.body.pantryBox.productKey),
    });

    await createPantryItem({
      pantryBoxId,
      userId: user.id,
      quantity: req.body.pantryItem.quantity,
      buyDate: req.body.pantryItem.buyDate,
      expirationDate: req.body.pantryItem.expireDate,
    });

    res.json({ pantryBoxKey: generatePantryBoxKey(pantryBoxId) });
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error ? error.message : `Something went wrong while `,
    });
  }
};
