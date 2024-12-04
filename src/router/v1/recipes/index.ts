import express from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import { upload } from "../../../db/aws.js";
import mysqlDB from "../../../db/mysql.js";
import { SerializedUser } from "../../../config/passport.js";
import { authGuard } from "../../../middleware/auth.js";
import { config } from "../../../config/index.js";
import {
  getNewRecipeData,
  generateRecipeKey,
  getNewProductData,
} from "./helper.js";
import { lightSlugify, splitString } from "../../../utils/normalize.js";
import { getImgUrl } from "../../../utils/img.js";

const router = express.Router();

export interface RecipesSimple extends RowDataPacket {
  id: number; // Non-nullable, int, default 0
  name: string; // Non-nullable, varchar(50)
  created_at: Date; // Timestamp for when the record was created
  updated_at: Date; // Timestamp for when the record was updated
  img: string; // Non-nullable, varchar(255)
  user_img?: string | null; // Nullable, varchar(255)
  user_username?: string | null; // Nullable, varchar(100)
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

interface QueryParams {
  q?: string;
  type?: string;
}

const SEARCH_TYPES = ["name", "tag", "ingredient", "product"];

router.get("/", async (req, res, next) => {
  try {
    const { q, type } = req.query as QueryParams;

    let data: RecipesSimple[] = [];

    if (type && !SEARCH_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid search type" });
    }

    if (!q) {
      const result = await mysqlDB.query<RecipesSimple[]>(
        `SELECT * FROM recipes_simple_view ORDER BY created_at DESC`
      );

      data = result[0];
    } else if (type === "name") {
      const result = await mysqlDB.query<RecipesSimple[]>(
        `SELECT 
            r.id AS id,
            r.name AS name,
            r.created_at AS created_at,
            r.updated_at AS updated_at,
            r.hours AS hours,
            r.minutes AS minutes,
            ri.recipe_img AS img,
            u.img AS user_img,
            u.username AS user_username,
            u.id AS user_id,
            GROUP_CONCAT(tag_id SEPARATOR ',') AS tag_ids,
            GROUP_CONCAT(tag_name SEPARATOR ',') AS tag_names
        FROM
            (SELECT * FROM recipes WHERE REPLACE(LOWER(name), ' ','-' ) LIKE LOWER(?)) AS r
        JOIN 
            users_simple_view u ON u.id = r.user_id
        JOIN 
            recipe_img_view ri ON ri.recipe_id = r.id
        LEFT JOIN 
            recipe_tags_view rt ON rt.recipe_id = r.id
        GROUP BY r.id , ri.recipe_img 
        ORDER BY r.created_at DESC;
        `,
        [`%${q}%`]
      );

      data = result[0];
    } else if (type === "tag") {
      const result = await mysqlDB.query<RecipesSimple[]>(
        `SELECT 
            r.id AS id,
            r.name AS name,
            r.created_at AS created_at,
            r.updated_at AS updated_at,
            r.hours AS hours,
            r.minutes AS minutes,
            ri.recipe_img AS img,
            u.img AS user_img,
            u.username AS user_username,
            u.id AS user_id,
            GROUP_CONCAT(tag_id SEPARATOR ',') AS tag_ids,
            GROUP_CONCAT(tag_name SEPARATOR ',') AS tag_names
          FROM
            recipes r
          JOIN 
            (SELECT DISTINCT recipe_id FROM recipe_tags_view WHERE LOWER(tag_name) = LOWER(?)) filtered_recipes
            ON filtered_recipes.recipe_id = r.id
          JOIN 
            recipe_img_view ri ON ri.recipe_id = r.id
          LEFT JOIN 
            recipe_tags_view rt ON rt.recipe_id = r.id
          JOIN 
            users_simple_view u ON u.id = r.user_id
          GROUP BY r.id , ri.recipe_img 
          ORDER BY r.created_at DESC;
          `,
        [`${q}`]
      );

      data = result[0];
    } else if (type === "ingredient") {
      const result = await mysqlDB.query<RecipesSimple[]>(
        `SELECT 
            r.id AS id,
            r.name AS name,
            r.created_at AS created_at,
            r.updated_at AS updated_at,
            r.hours AS hours,
            r.minutes AS minutes,
            ri.recipe_img AS img,
            u.img AS user_img,
            u.username AS user_username,
            u.id AS user_id,
            GROUP_CONCAT(rt.tag_id SEPARATOR ',') AS tag_ids,
            GROUP_CONCAT(rt.tag_name SEPARATOR ',') AS tag_names
        FROM
            recipes r
        JOIN 
            (SELECT DISTINCT recipe_id FROM recipe_ingredients WHERE LOWER(name) = LOWER(?)) filtered_recipes
            ON filtered_recipes.recipe_id = r.id
        JOIN 
            recipe_img_view ri ON ri.recipe_id = r.id
        LEFT JOIN 
            recipe_tags_view rt ON rt.recipe_id = r.id
        JOIN 
            users_simple_view u ON u.id = r.user_id
        GROUP BY 
            r.id, ri.recipe_img
            ORDER BY 
            r.created_at DESC;
        `,
        [q]
      );

      data = result[0];
    } else if (type === "product") {
      const result = await mysqlDB.query<RecipesSimple[]>(
        `
          SELECT 
              r.id AS id,
              r.name AS name,
              r.created_at AS created_at,
              r.updated_at AS updated_at,
              r.hours AS hours,
              r.minutes AS minutes,
              ri.recipe_img AS img,
              u.img AS user_img,
              u.username AS user_username,
              u.id AS user_id,
              GROUP_CONCAT(tag_id SEPARATOR ',') AS tag_ids,
              GROUP_CONCAT(tag_name SEPARATOR ',') AS tag_names
          FROM
            recipes r
          JOIN 
            (
              SELECT recipe_id
                FROM 
                  (SELECT * FROM products WHERE REPLACE(LOWER(name), ' ', '-') = REPLACE(LOWER(?), ' ', '-')) AS filtered_products
                JOIN 
              recipe_ingredients rig ON rig.product_id = filtered_products.id
            ) 
            AS filtered_recipes	ON filtered_recipes.recipe_id = r.id
          JOIN 
              recipe_img_view ri ON ri.recipe_id = r.id
          LEFT JOIN 
              recipe_tags_view rt ON rt.recipe_id = r.id
          JOIN 
              users_simple_view u ON u.id = r.user_id
          GROUP BY r.id, r.name, r.created_at, r.updated_at, r.hours, r.minutes, ri.recipe_img, u.img, u.username, u.id
          ORDER BY r.created_at DESC;
          `,
        [q]
      );

      data = result[0];
    } else {
      return res.status(400).json({ error: "Invalid search type" });
    }

    const result: ClientRecipeSimple[] = data.map((recipe) => {
      const tagIds = splitString(recipe.tag_ids);
      const tagNames = splitString(recipe.tag_names);
      const tags = tagIds.map((id, index) => ({
        id: parseInt(id, 10),
        name: tagNames[index],
      }));

      const key = generateRecipeKey(recipe.id, recipe.name);

      return {
        id: recipe.id,
        name: recipe.name,
        img: getImgUrl(recipe.img, true),
        tags,
        hours: recipe.hours,
        minutes: recipe.minutes,
        key,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/home", async (req, res, next) => {
  try {
    const [data] = await mysqlDB.query<RecipesSimple[]>(
      `SELECT * FROM recipes_simple_view ORDER BY created_at DESC LIMIT 18`
    );

    const result: ClientRecipeSimple[] = data.map((recipe) => {
      const tagIds = splitString(recipe.tag_ids);
      const tagNames = splitString(recipe.tag_names);
      const tags = tagIds.map((id, index) => ({
        id: parseInt(id, 10),
        name: tagNames[index],
      }));

      const key = generateRecipeKey(recipe.id, recipe.name);

      return {
        id: recipe.id,
        name: recipe.name,
        img: getImgUrl(recipe.img, true),
        tags,
        hours: recipe.hours,
        minutes: recipe.minutes,
        key,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

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
