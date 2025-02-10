import { NextFunction, Request, Response } from "express";

import { decryptRecipeURLAndGetRecipeId } from "../../../services/recipes/recipe/helper.js";
import { validateId } from "../../../utils/numbers.js";
import { ServiceError } from "../../../services/helpers/ServiceError.js";
import { getRecipeService } from "../../../services/recipes/recipe/getRecipeService.js";

interface GetRecipeParams {
  key: string;
}

export const getRecipe = async (
  req: Request<GetRecipeParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipeId = decryptRecipeURLAndGetRecipeId(req.params.key);

    if (!recipeId || !validateId(recipeId)) {
      throw new ServiceError(400, "Invalid recipe ID");
    }

    const recipe = await getRecipeService(recipeId);

    return res.status(200).json(recipe);
  } catch (error) {
    if (error instanceof ServiceError) {
      next({ status: error.status, message: error.message });
      return;
    }

    next({
      status: 400,
      message: "Error getting recipe",
    });
  }
};
