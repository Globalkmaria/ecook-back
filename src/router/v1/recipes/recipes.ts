import express from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import { upload } from "../../../db/aws.js";
import mysqlDB from "../../../db/mysql.js";
import { SerializedUser } from "../../../config/passport.js";
import { authGuard } from "../../../middleware/auth.js";
import {
  getNewRecipeData,
  generateRecipeKey,
  getNewProductData,
} from "./helper.js";
import { lightSlugify } from "../../../utils/normalize.js";
import { searchRecipes } from "../../../controller/recipes/recipesSearchController.js";
import { homeRecipes } from "../../../controller/recipes/recipesHomeController.js";

const router = express.Router();

export interface RecipesSimple extends RowDataPacket {
  id: number; // Non-nullable, int, default 0
  name: string; // Non-nullable, varchar(50)
  created_at: Date; // Timestamp for when the record was created
  updated_at: Date; // Timestamp for when the record was updated
  img: string; // Non-nullable, varchar(255)
  user_img?: string | null; // Nullable, varchar(255)
  user_username: string; //  varchar(100)
  user_id: number; // Non-nullable, int, default 0
  tag_ids?: string | null; // Nullable, text (could store a list of tag IDs as a string)
  tag_names?: string | null; // Nullable, text (could store a list of tag names as a string)
  hours: number; // Non-nullable, int, default 0
  minutes: number; // Non-nullable, int, default 0
}

export interface ClientRecipeSimple {
  id: number;
  name: string;
  img: string;
  tags: { id: number; name: string }[];
}

/**
 * @route GET /api/recipes
 * @desc  Search recipes by name, tag, ingredient, product, or username
 * @access Public
 */

router.get("/", searchRecipes);

/**
 * @route GET /api/recipes/home
 * @desc  Get home page recipes
 * @access Public
 */
router.get("/home", homeRecipes);

// ---
export interface IngredientNewProduct {
  name: string;
  brand: string | null;
  purchasedFrom: string | null;
  link: string | null;
  img: File | null;
  id: string | null;
}

interface NewRecipeIngredient {
  name: string;
  quantity: string;
  ingredientId: number | null;
  productId: number | null;
  newProduct: IngredientNewProduct | null;
}

export interface INewRecipe {
  name: string;
  description: string;
  hours: number;
  minutes: number;
  steps: string[];
  ingredients: NewRecipeIngredient[];
  tags: string[];
}

router.post("/", authGuard, upload.any(), async (req, res, next) => {
  const connection = await mysqlDB.getConnection();
  try {
    const files = req.files as Express.MulterS3.File[];
    const filesKeys = new Map<string, string>(
      files.map((file) => [file.fieldname, file.key])
    );

    const user = req.user as SerializedUser;
    const userId = user.id;

    // body info needs to be json parsed
    const info = JSON.parse(req.body.info) as INewRecipe;

    // check if required fields are present
    if (!info.name || !info.steps || !filesKeys.has("img"))
      return res.status(400).json({ error: "Missing required fields" });

    // recipe
    const [recipeResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO recipes (name, user_id, hours, minutes, description, steps) VALUES (?,?,?,?,?,?)`,
      getNewRecipeData(info, userId)
    );

    const recipeId = recipeResult.insertId;

    // recipe main img required

    const img = filesKeys.get("img");
    const [imgResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
      [img, userId]
    );

    const imgId = imgResult.insertId;

    await connection.query<ResultSetHeader>(
      `INSERT INTO recipe_imgs (recipe_id, img_id) VALUES (?,?)`,
      [recipeId, imgId]
    );

    // tags

    if (info.tags.length) {
      await connection.execute<ResultSetHeader>(
        `INSERT IGNORE INTO tags (user_id, name) VALUES ${info.tags
          .map(() => "(?, ?)")
          .join(", ")}`,
        info.tags.flatMap((tag) => [userId, tag])
      );

      const [tagsIds] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM tags WHERE name IN (?)`,
        [info.tags]
      );

      await connection.query<ResultSetHeader>(
        `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${tagsIds
          .map(() => `(${recipeId}, ?)`)
          .join(", ")}`,
        tagsIds.map((tag) => tag.id)
      );
    }

    // ingredients

    // normalize ingredient names
    const ingredients = info.ingredients.map((ingredient) => ({
      ...ingredient,
      name: lightSlugify(ingredient.name),
    }));

    const ingredientsNames = ingredients.map((ingredient) => ingredient.name);

    if (ingredients.length) {
      await connection.execute<ResultSetHeader>(
        `INSERT IGNORE INTO ingredients (name, user_id) VALUES ${ingredientsNames
          .map(() => `(?, ?)`)
          .join(", ")}`,
        ingredientsNames.flatMap((name) => [name, userId])
      );

      const placeholders = ingredientsNames.map(() => "?").join(", ");
      const [ingredientsIds] = await connection.execute<RowDataPacket[]>(
        `SELECT id, name FROM ingredients WHERE name IN (${placeholders}) ORDER BY FIELD(name, ${placeholders})`,
        [...ingredientsNames, ...ingredientsNames]
      );

      const ingredientNameAndIdMap = new Map<string, number>(
        ingredientsIds.map((ingredient) => [ingredient.name, ingredient.id])
      );

      for (const ingredient of ingredients) {
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
            const [imgId] = await connection.query<ResultSetHeader>(
              `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
              [img, userId]
            );

            await connection.query<ResultSetHeader>(
              `INSERT INTO product_imgs (product_id, img_id) VALUES (?,?)`,
              [productId, imgId.insertId]
            );
          }

          // link product - ingredient
          await connection.query<ResultSetHeader>(
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
    const key = generateRecipeKey(recipeId, info.name);
    res.status(200).json({ message: "POST /recipes", key });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;
