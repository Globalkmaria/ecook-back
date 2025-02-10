import express from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import mysqlDB from "../../../../db/mysql.js";
import { upload } from "../../../../db/aws.js";
import { INewRecipe } from "../recipes.js";
import { authGuard } from "../../../../middleware/auth.js";
import { validateId } from "../../../../utils/numbers.js";
import { SerializedUser } from "../../../../config/passport.js";
import {
  decryptRecipeURLAndGetRecipeId,
  getTagsToInsertAndDelete,
  getUpdatedRecipeData,
} from "./helper.js";
import { generateRecipeKey, getNewProductData } from "../helper.js";
import { lightSlugify } from "../../../../utils/normalize.js";
import { getRecipe } from "../../../../controllers/recipes/recipe/getRecipeController.js";

const router = express.Router();

export interface RecipeInfo extends RowDataPacket {
  id: number; // Primary key, auto_increment
  name: string; // Non-nullable, varchar(50)
  user_id: number; //  foreign key
  hours: number; // Non-nullable, int
  minutes: number; // Non-nullable, int
  description?: string; // Nullable, varchar(255)
  steps: string[]; // Json string[], JSON type in TypeScript as Record<string, any> or object
  created_at: Date; // Timestamp with CURRENT_TIMESTAMP default
  updated_at: Date; // Timestamp with auto-update on change
}

export interface User extends RowDataPacket {
  id: number; // Primary key, auto_increment
  username: string; // Non-nullable, varchar(100)
  email: string; // Non-nullable, varchar(255)
  hashed_password: string; // Non-nullable, VARBINARY(255)
  salt: string; // Non-nullable, VARBINARY(255)
  name?: string; //  varchar(100)
  img?: string; // Nullable, varchar(255)
  youtube_link?: string; // Nullable, varchar(255)
  created_at?: Date; // Timestamp, default CURRENT_TIMESTAMP
  updated_at?: Date; // Timestamp, auto-update on change
  instagram_link?: string; // Nullable, varchar(255)
}

export type UserSimple = RowDataPacket &
  Pick<User, "id" | "username" | "img" | "first_name">;

export type EditRecipe = INewRecipe & { id: number };

router.get("/:key", getRecipe);

router.delete("/:key", authGuard, async (req, res, next) => {
  const connection = await mysqlDB.getConnection();

  try {
    const recipeId = decryptRecipeURLAndGetRecipeId(req.params.key);

    if (!recipeId || !validateId(recipeId))
      return res.status(400).json({ error: "Invalid recipe ID" });

    await connection.beginTransaction();

    const [recipeInfo] = await connection.execute<RecipeInfo[]>(
      `SELECT * FROM recipes WHERE id = ?`,
      [recipeId]
    );

    if (!recipeInfo.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Recipe not found" });
    }

    const user = req.user as SerializedUser;

    if (recipeInfo[0].user_id !== user.id)
      return res.status(403).json({ error: "Forbidden" });

    await connection.query(`DELETE FROM recipe_imgs WHERE recipe_id = ?`, [
      recipeId,
    ]);
    await connection.query(
      `DELETE FROM recipe_ingredients WHERE recipe_id = ?`,
      [recipeId]
    );
    await connection.query(`DELETE FROM recipe_tags WHERE recipe_id = ?`, [
      recipeId,
    ]);

    await connection.query(`DELETE FROM recipes WHERE id = ?`, [recipeId]);
    await connection.commit();

    return res.status(200).json({ message: "Recipe deleted" });
  } catch (error) {
    console.error(
      `Error deleting recipe with ID ${req.params.recipeId}:`,
      error
    );
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.put("/:key", authGuard, upload.any(), async (req, res, next) => {
  const connection = await mysqlDB.getConnection();
  try {
    const recipeId = decryptRecipeURLAndGetRecipeId(req.params.key);
    if (!recipeId || !validateId(recipeId))
      return res.status(400).json({ error: "Invalid recipe ID" });

    const files = req.files as Express.MulterS3.File[];
    const filesKeys = new Map<string, string>(
      files.map((file) => [file.fieldname, file.key])
    );

    const user = req.user as User;

    const info = JSON.parse(req.body.info) as EditRecipe;
    const userId = user.id;

    await connection.beginTransaction();

    const [existingRecipe] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM recipes WHERE id = ? AND user_id = ?`,
      [recipeId, userId]
    );

    if (!existingRecipe.length) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "Recipe not found or unauthorized" });
    }

    // recipe

    const currentRecipe = existingRecipe[0] as RecipeInfo;

    if (currentRecipe.user_id !== userId) {
      await connection.rollback();
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = getUpdatedRecipeData(info, currentRecipe);

    if (updates.size > 0) {
      const updateFields = [...updates.keys()]
        .map((field) => `${field} = ?`)
        .join(", ");
      const updateValues = updates.values();

      await connection.execute(
        `UPDATE recipes SET ${updateFields} WHERE id = ?`,
        [...updateValues, recipeId]
      );
    }

    // img

    if (filesKeys.has("img")) {
      // save recipe img location
      const imgUrl = filesKeys.get("img");

      const [existingImg] = await connection.execute<RowDataPacket[]>(
        `SELECT img_id FROM recipe_imgs WHERE recipe_id = ?`,
        [recipeId]
      );

      if (existingImg.length) {
        await connection.execute(`UPDATE imgs SET url = ? WHERE id = ?`, [
          imgUrl,
          existingImg[0].img_id,
        ]);
      } else {
        const [imgResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO imgs (url, user_id) VALUES (?, ?)`,
          [imgUrl, userId]
        );

        const imgId = imgResult.insertId;

        await connection.execute<ResultSetHeader>(
          `INSERT INTO recipe_imgs (recipe_id, img_id) VALUES (?,?)`,
          [recipeId, imgId]
        );
      }
    }

    // tags

    if (!info.tags.length) {
      await connection.execute(`DELETE FROM recipe_tags WHERE recipe_id = ?`, [
        recipeId,
      ]);
    } else if (info.tags.length) {
      const [existingTags] = await connection.query<
        (RowDataPacket & { name: string })[]
      >(
        `SELECT name FROM tags WHERE id IN (SELECT tag_id FROM recipe_tags WHERE recipe_id = ?)`,
        [recipeId]
      );

      const oldTagsNames = existingTags.map((tag) => tag.name);
      const { tagsToInsert, tagsToDelete } = getTagsToInsertAndDelete(
        oldTagsNames,
        info.tags
      );

      // Remove only unnecessary tags
      if (tagsToDelete.length) {
        const [tagsIds] = await connection.query<RowDataPacket[]>(
          `SELECT id FROM tags WHERE name IN (?)`,
          [tagsToDelete]
        );

        const tagIdsArray = tagsIds.map((tag) => tag.id);
        const placeholders = tagIdsArray.map(() => "?").join(", ");

        await connection.execute(
          `DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id IN (${placeholders})`,
          [recipeId, ...tagIdsArray]
        );
      }

      // Insert only new tags
      if (tagsToInsert.length) {
        await connection.execute(
          `INSERT IGNORE INTO tags (user_id, name) VALUES ${tagsToInsert
            .map(() => "(?, ?)")
            .join(", ")}`,
          tagsToInsert.flatMap((tag) => [userId, tag])
        );

        const [tagsIds] = await connection.query<RowDataPacket[]>(
          `SELECT id FROM tags WHERE name IN (?)`,
          [tagsToInsert]
        );

        await connection.execute(
          `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${tagsToInsert
            .map(() => `(${recipeId}, ?)`)
            .join(", ")}`,
          tagsIds.map((tag) => tag.id)
        );
      }
    }

    // ingredients

    const ingredientNames = info.ingredients.map((ingredient) =>
      lightSlugify(ingredient.name)
    );

    if (info.ingredients.length) {
      await connection.execute(
        `INSERT IGNORE INTO ingredients (name, user_id) VALUES ${ingredientNames
          .map(() => `(?, ${userId})`)
          .join(", ")}`,
        ingredientNames
      );

      const [ingredientsIds] = await connection.query<RowDataPacket[]>(
        `SELECT id, name FROM ingredients WHERE name IN (?) ORDER BY FIELD(name, ?)`,
        [ingredientNames, ingredientNames]
      );

      const ingredientNameAndIdMap = new Map<string, number>(
        ingredientsIds.map((ingredient) => [ingredient.name, ingredient.id])
      );

      await connection.execute(
        `DELETE FROM recipe_ingredients WHERE recipe_id = ?`,
        [recipeId]
      );

      for (const ingredient of info.ingredients) {
        const ingredientId = ingredientNameAndIdMap.get(ingredient.name);
        let productId = ingredient.productId;

        if (
          ingredient.newProduct &&
          Object.keys(ingredient.newProduct).length
        ) {
          // save product and get product id
          const newProduct = ingredient.newProduct;
          const [newProductId] = await connection.execute<ResultSetHeader>(
            `INSERT INTO products (user_id, name, brand, purchased_from, link) VALUES (?,?,?,?,?)`,
            [userId, ...getNewProductData(newProduct)]
          );

          productId = newProductId.insertId;
          // link product img
          if (filesKeys.has(`img_${newProduct.id}`)) {
            const img = filesKeys.get(`img_${newProduct.id}`);
            const [imgId] = await connection.execute<ResultSetHeader>(
              `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
              [img, userId]
            );

            await connection.execute<ResultSetHeader>(
              `INSERT INTO product_imgs (product_id, img_id) VALUES (?,?)`,
              [productId, imgId.insertId]
            );
          }

          // link product - ingredient
          await connection.execute<ResultSetHeader>(
            `INSERT INTO ingredient_products (ingredient_id, product_id) VALUES (?,?)`,
            [ingredientNameAndIdMap.get(ingredient.name), productId]
          );
        }

        // link recipe - ingredient
        await connection.execute<ResultSetHeader>(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, product_id, name, quantity) VALUES (?,?,?,?, ?)`,
          [
            recipeId,
            ingredientId ?? null,
            productId ?? null,
            ingredient.name,
            ingredient.quantity,
          ]
        );
      }
    }

    await connection.commit();

    const key = generateRecipeKey(Number(recipeId), info.name);

    res.status(200).json({ message: "Recipe updated successfully", key });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;
