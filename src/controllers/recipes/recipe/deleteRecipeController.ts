import { NextFunction, Request, Response } from "express";

import { decryptRecipeURLAndGetRecipeId } from "../../../router/v1/recipes/recipe/helper.js";
import { validateId } from "../../../utils/numbers.js";
import { ServiceError } from "../../../services/helpers/ServiceError.js";
import {
  deleteRecipeById,
  getRecipe,
} from "../../../services/recipes/recipe/deleteRecipeService.js";
import { SerializedUser } from "../../../config/passport.js";

type DeleteRecipeParams = {
  key: string;
};

export const deleteRecipe = async (
  req: Request<DeleteRecipeParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipeId = decryptRecipeURLAndGetRecipeId(req.params.key);
    if (!recipeId || !validateId(recipeId))
      throw new ServiceError(400, "Invalid recipe ID");

    const recipe = await getRecipe(recipeId);
    if (!recipe) throw new ServiceError(404, "Recipe not found");

    const user = req.user as SerializedUser;
    if (recipe.user_id !== user.id) throw new ServiceError(403, "Forbidden");

    await deleteRecipeById(recipeId);

    return res.status(200);
  } catch (error) {
    next({
      statue: 400,
      message: "Something went wrong while deleting the recipe",
    });
  }
};
