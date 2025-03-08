import { NextFunction, Request, Response } from "express";

import { getPantryBox } from "../../../../services/pantry/pantryBoxes/getPantryBox";
import { decryptPantryBoxKeyWithThrowError } from "../../../../services/pantry/utils";

type getPantryBoxParams = {
  pantryBoxKey: string;
};

type getPantryBoxResponse = {
  key: string;
  img: string | null;
  ingredientName: string;
  productName: string | null;

  items: {
    key: string;
    buyDate: Date;
    expireDate: Date;
    quantity: number;
  }[];
} | null;

export const getPantryBoxController = async (
  req: Request<getPantryBoxParams>,
  res: Response<getPantryBoxResponse>,
  next: NextFunction
) => {
  try {
    const { pantryBoxKey } = req.params;
    const pantryBoxId = decryptPantryBoxKeyWithThrowError(pantryBoxKey);

    const pantryBoxInfo = await getPantryBox(pantryBoxId);
    if (!pantryBoxInfo) {
      return res.json(null);
    }

    return res.json(pantryBoxInfo);
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : `Something went wrong while fetching pantry box`,
    });
  }
};
