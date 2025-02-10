import { Request } from "express";

import mysqlDB from "../../../db/mysql.js";

import { SerializedUser } from "../../../config/passport.js";

import { INewRecipe } from "../../../router/v1/recipes/recipes.js";
import { generateRecipeKey } from "../../../router/v1/recipes/helper.js";
import { CreateRecipeBody } from "../../../controllers/recipes/recipesCreateController.js";
import {
  insertIngredients,
  insertRecipe,
  insertRecipeImage,
  insertTags,
} from "./helper.js";

export const createRecipeService = async (
  req: Request<{}, {}, CreateRecipeBody>
) => {
  const connection = await mysqlDB.getConnection();

  try {
    const files = req.files as Express.MulterS3.File[];
    const filesKeys = new Map<string, string>(
      files.map((file) => [file.fieldname, file.key])
    );

    const user = req.user as SerializedUser;
    const userId = user.id;

    const info = JSON.parse(req.body.info) as INewRecipe;

    // check if required fields are present
    if (!info.name || !info.steps || !filesKeys.has("img")) {
      throw new Error("Missing required fields");
    }

    // recipe
    const recipeId = await insertRecipe(info, userId, connection);

    // recipe main img required
    const img = filesKeys.get("img");
    if (img) {
      await insertRecipeImage(recipeId, img, userId, connection);
    }

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
