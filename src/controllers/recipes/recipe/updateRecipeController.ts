import { NextFunction, Request, Response } from "express";

import { processAndUploadImage } from "../../../db/aws";
import { ServiceError } from "../../../services/helpers/ServiceError";
import { EditRecipe , User } from "../../../services/recipes/recipe/type";
import { updateRecipeService } from "../../../services/recipes/recipe/updateRecipeService";
import { decryptRecipeURLAndGetRecipeId , generateRecipeKey } from "../../../services/recipes/utils";
import { validateId } from "../../../utils/numbers";

type UpdateRecipeParams = {
  key: string;
};

type UpdateRecipeBody = {
  info: string;
};

export const updateRecipe = async (
  req: Request<UpdateRecipeParams, "", UpdateRecipeBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipeId = decryptRecipeURLAndGetRecipeId(req.params.key);
    if (!recipeId || !validateId(recipeId))
      throw new ServiceError(400, "Invalid recipe ID");

    const files = req.files as Express.MulterS3.File[];
    const keys = await Promise.all(
      files.map((file) => processAndUploadImage(file))
    );
    const filesKeys = new Map<string, string>(
      files.map((file, i) => [file.fieldname, keys[i]])
    );

    const user = req.user as User;
    const userId = user.id;

    const info = JSON.parse(req.body.info) as EditRecipe;

    await updateRecipeService({ recipeId, userId, info, filesKeys });

    const key = generateRecipeKey(Number(recipeId), info.name);

    res.status(200).json({ message: "Recipe updated successfully", key });
  } catch (error) {
    next(error);
  }
};
