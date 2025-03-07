import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { SerializedUser } from "../../../config/passport";
import mysqlDB from "../../../db/mysql";
import { ServiceError } from "../../../services/helpers/ServiceError";
import { decryptIngredientKeyWithThrowError } from "../../../services/ingredients/utils";
import { createPantryBox } from "../../../services/pantry/pantryBoxes/createPantryBox";
import { createPantryItem } from "../../../services/pantry/pantryItems/createPantryItem";
import { generatePantryBoxKey } from "../../../services/pantry/utils";
import { decryptProductKeyWithThrowError } from "../../../services/products/utils";

type CreatePantryBoxRequestBody = {
  pantryBox: {
    ingredientKey: string;
    productKey?: string;
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
  req: Request<
    ParamsDictionary,
    CreatePantryBoxResponse,
    CreatePantryBoxRequestBody
  >,
  res: Response<CreatePantryBoxResponse>,
  next: NextFunction
) => {
  const connection = await mysqlDB.getConnection();
  try {
    const user = req.user as SerializedUser;
    const ingredientId = decryptIngredientKeyWithThrowError(
      req.body.pantryBox.ingredientKey
    );
    const productId = req.body.pantryBox.productKey
      ? decryptProductKeyWithThrowError(req.body.pantryBox.productKey)
      : null;

    const pantryBoxId = await createPantryBox(
      {
        userId: user.id,
        ingredientId,
        productId,
      },
      connection
    );

    if (!pantryBoxId) {
      throw new ServiceError(400, "Failed to create pantry box");
    }

    await createPantryItem(
      {
        pantryBoxId,
        userId: user.id,
        quantity: req.body.pantryItem.quantity,
        buyDate: req.body.pantryItem.buyDate,
        expireDate: req.body.pantryItem.expireDate,
      },
      connection
    );

    res.json({ pantryBoxKey: generatePantryBoxKey(pantryBoxId) });
  } catch (error) {
    await connection.rollback();
    next({
      status: 400,
      message:
        error instanceof Error ? error.message : `Something went wrong while `,
    });
  } finally {
    connection.release();
  }
};
