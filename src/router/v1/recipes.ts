import { config } from "../../config";
import { upload } from "../../db/aws";
import mysqlDB from "../../db/mysql";
import express from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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

router.get("/", async (req, res, next) => {
  try {
    const [data] = await mysqlDB.query<RecipesSimple[]>(
      `SELECT * FROM recipes_simple_view`
    );

    const result: ClientRecipeSimple[] = data.map((recipe) => {
      const tagIds = recipe.tag_ids ? recipe.tag_ids.split(",") : [];
      const tagNames = recipe.tag_names ? recipe.tag_names.split(",") : [];
      const tags = tagIds.map((id, index) => ({
        id: parseInt(id, 10),
        name: tagNames[index],
      }));

      return {
        id: recipe.id,
        name: recipe.name,
        img: config.img.dbUrl + recipe.img,
        tags,
        hours: recipe.hours,
        minutes: recipe.minutes,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// ---
interface IngredientNewProduct {
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
  user: { id: number };
}

router.post("/", upload.any(), async (req, res, next) => {
  try {
    const files = req.files as Express.MulterS3.File[];
    const filesKeys = new Map<string, string>(
      files.map((file) => [file.fieldname, file.key])
    );

    const info = JSON.parse(req.body.info) as INewRecipe;

    const userId = info.user.id;

    // recipe
    const [recipeResult] = await mysqlDB.execute<ResultSetHeader>(
      `INSERT INTO recipes (name, user_id, hours, minutes, description, steps) VALUES (?,?,?,?,?,?)`,
      [
        info.name,
        userId,
        Number(info.hours) ?? 0,
        Number(info.minutes) ?? 0,
        info.description,
        info.steps,
      ]
    );

    const recipeId = recipeResult.insertId;

    // img

    if (filesKeys.has("img")) {
      // save recipe img location
      const img = filesKeys.get("img");
      const [imgResult] = await mysqlDB.execute<ResultSetHeader>(
        `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
        [img, userId]
      );

      const imgId = imgResult.insertId;

      await mysqlDB.execute<ResultSetHeader>(
        `INSERT INTO recipe_imgs (recipe_id, img_id) VALUES (?,?)`,
        [recipeId, imgId]
      );
    }

    // tags

    if (info.tags.length) {
      await mysqlDB.execute<ResultSetHeader>(
        `INSERT IGNORE INTO tags (user_id, name) VALUES ${info.tags
          .map(() => "(?, ?)")
          .join(", ")}`,
        info.tags.flatMap((tag) => [userId, tag])
      );

      const [tagsIds] = await mysqlDB.query<RowDataPacket[]>(
        `SELECT id FROM tags WHERE name IN (?)`,
        [info.tags]
      );

      await mysqlDB.execute<ResultSetHeader>(
        `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${tagsIds
          .map(() => `(${recipeId}, ?)`)
          .join(", ")}`,
        tagsIds.map((tag) => tag.id)
      );
    }

    // ingredients

    const ingredientNames = info.ingredients.map((ingredient) =>
      ingredient.name.toLowerCase()
    );

    if (info.ingredients.length) {
      await mysqlDB.execute<ResultSetHeader>(
        `INSERT IGNORE INTO ingredients (name, user_id) VALUES ${info.ingredients
          .map(() => `(?, ${userId})`)
          .join(", ")}`,
        ingredientNames
      );

      const [ingredientsIds] = await mysqlDB.query<RowDataPacket[]>(
        `SELECT id, name FROM ingredients WHERE name IN (?) ORDER BY FIELD(name, ?)`,
        [ingredientNames, ingredientNames]
      );

      const ingredientNameAndIdMap = new Map<string, number>(
        ingredientsIds.map((ingredient) => [ingredient.name, ingredient.id])
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
          const [newProductId] = await mysqlDB.execute<ResultSetHeader>(
            `INSERT INTO products (user_id, name, brand, purchased_from, link) VALUES (?,?,?,?,?)`,
            [
              userId,
              newProduct?.name ?? "",
              newProduct?.brand ?? "",
              newProduct?.purchasedFrom ?? "",
              newProduct?.link ?? "",
            ]
          );

          productId = newProductId.insertId;
          // link product img
          if (filesKeys.has(`img_${newProduct.id}`)) {
            const img = filesKeys.get(`img_${newProduct.id}`);
            const [imgId] = await mysqlDB.execute<ResultSetHeader>(
              `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
              [img, userId]
            );

            await mysqlDB.execute<ResultSetHeader>(
              `INSERT INTO product_imgs (product_id, img_id) VALUES (?,?)`,
              [productId, imgId.insertId]
            );
          }

          // link product - ingredient
          await mysqlDB.execute<ResultSetHeader>(
            `INSERT INTO ingredient_products (ingredient_id, product_id) VALUES (?,?)`,
            [ingredientNameAndIdMap.get(ingredient.name), productId]
          );
        }

        // link recipe - ingredient
        await mysqlDB.execute<ResultSetHeader>(
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

    res.status(200).json({ message: "POST /recipes", id: recipeId });
  } catch (error) {
    next(error);
  }
});

export default router;
