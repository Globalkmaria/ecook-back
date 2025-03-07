import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../../config/passport.js";
import { getPantryBoxes } from "../../../services/pantry/pantryBoxes/getPantryBoxes.js";

type GetPantryBoxesResponse = {
  key: string;
  img: string | null;
  buyDate: Date;
  expireDate: Date;
  ingredientName: string;
  productName: string | null;
  quantity: number;
}[];

export const getPantryBoxesController = async (
  req: Request,
  res: Response<GetPantryBoxesResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const pantryBoxes = await getPantryBoxes(user.id);

    res.json(pantryBoxes);
  } catch (error) {
    console.error(error);
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : `Something went wrong while fetching pantry boxes`,
    });
  }
};
