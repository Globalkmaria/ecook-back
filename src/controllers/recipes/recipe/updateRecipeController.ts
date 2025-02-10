import { NextFunction, Request, Response } from "express";

import { decryptRecipeURLAndGetRecipeId } from "../../../services/recipes/recipe/helper.js";
import { validateId } from "../../../utils/numbers.js";
import { ServiceError } from "../../../services/helpers/ServiceError.js";
import { EditRecipe } from "../../../services/recipes/recipe/type.js";
import { User } from "../../../services/recipes/recipe/type.js";
import { generateRecipeKey } from "../../../router/v1/recipes/helper.js";
import { updateRecipeService } from "../../../services/recipes/recipe/updateRecipeService.js";

type UpdateRecipeParams = {
  key: string;
};

type UpdateRecipeBody = {
  info: string;
};

export const updateRecipe = async (
  req: Request<UpdateRecipeParams, {}, UpdateRecipeBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipeId = decryptRecipeURLAndGetRecipeId(req.params.key);
    if (!recipeId || !validateId(recipeId))
      throw new ServiceError(400, "Invalid recipe ID");

    const files = req.files as Express.MulterS3.File[];
    const filesKeys = new Map<string, string>(
      files.map((file) => [file.fieldname, file.key])
    );

    const user = req.user as User;
    const userId = user.id;

    const info = JSON.parse(req.body.info) as EditRecipe;

    await updateRecipeService({ recipeId, userId, info, filesKeys });

    const key = generateRecipeKey(Number(recipeId), info.name);

    res.status(200).json({ message: "Recipe updated successfully", key });
  } catch (error) {
    next(error);
  } finally {
  }
};
