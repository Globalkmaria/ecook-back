import { NextFunction, Request, Response } from "express";

import { decryptPantryBoxKeyWithThrowError } from "../../../../services/pantry/utils.js";
import { deletePantryBox } from "../../../../services/pantry/pantryBoxes/deletePantryBox.js";

type DeletePantryBoxParams = {
  pantryBoxKey: string;
};

export const deletePantryBoxController = async (
  req: Request<DeletePantryBoxParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pantryBoxKey } = req.params;
    const pantryBoxId = decryptPantryBoxKeyWithThrowError(pantryBoxKey);

    await deletePantryBox(pantryBoxId);

    res.status(204).send;
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : `Something went wrong while deleting pantry box`,
    });
  }
};
