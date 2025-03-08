import { Request } from "express";

import { SerializedUser } from "../../../config/passport";
import { CreateRecipeBody } from "../../../controllers/recipes/recipesCreateController";
import { processAndUploadImage } from "../../../db/aws";
import mysqlDB from "../../../db/mysql";
import { ServiceError } from "../../helpers/ServiceError";
import { INewRecipe } from "../type";
import { generateRecipeKey } from "../utils";

import {
  insertIngredients,
  insertRecipe,
  insertRecipeImage,
  insertTags,
  isRequiredFieldsPresent,
} from "./helper";


export const createRecipeService = async (
  req: Request<"", "", CreateRecipeBody>
) => {
  const connection = await mysqlDB.getConnection();

  try {
    const files = req.files as Express.MulterS3.File[];

    const keys = await Promise.all(
      files.map((file) => processAndUploadImage(file))
    );

    const filesKeys = new Map<string, string>(
      files.map((file, i) => [file.fieldname, keys[i]])
    );

    const user = req.user as SerializedUser;
    const userId = user.id;

    const info = JSON.parse(req.body.info) as INewRecipe;

    if (!isRequiredFieldsPresent(info))
      throw new ServiceError(400, "Missing required fields");

    const recipeImg = filesKeys.get("img");
    if (!recipeImg) throw new ServiceError(400, "Missing recipe image");

    const recipeId = await insertRecipe(info, userId, connection);

    await insertRecipeImage(recipeId, recipeImg, userId, connection);

    if (info.tags.length) {
      await insertTags(info.tags, userId, recipeId, connection);
    }

    await insertIngredients(
      info.ingredients,
      filesKeys,
      userId,
      recipeId,
      connection
    );

    await connection.commit();

    return {
      key: generateRecipeKey(recipeId, info.name),
    };
  } catch (error) {
    console.error(error);
    await connection.rollback();

    const message = typeof error === "string" ? error : "Error creating recipe";
    throw new Error(message);
  } finally {
    connection.release();
  }
};
