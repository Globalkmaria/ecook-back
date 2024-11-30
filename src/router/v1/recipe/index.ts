import express from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import mysqlDB from "../../../db/mysql";
import { upload } from "../../../db/aws";
import { ClientProduct, Product } from "../products";
import { config } from "../../../config";
import { INewRecipe } from "../recipes";
import { authGuard } from "../../../middleware/auth";
import { validateId } from "../../../utils/numbers";
import { SerializedUser } from "../../../config/passport";

const router = express.Router();

interface RecipeInfo extends RowDataPacket {
  id: number; // Primary key, auto_increment
  name: string; // Non-nullable, varchar(50)
  user_id: number; //  foreign key
  hours: number; // Non-nullable, int
  minutes: number; // Non-nullable, int
  description?: string; // Nullable, varchar(255)
  steps?: string[]; // Json string[] Nullable, JSON type in TypeScript as Record<string, any> or object
  created_at: Date; // Timestamp with CURRENT_TIMESTAMP default
  updated_at: Date; // Timestamp with auto-update on change
}

interface RecipeIngredient extends RowDataPacket {
  id: number; // Primary key, auto_increment
  recipe_id: number; // Non-nullable, int
  ingredient_name: string; // Non-nullable, varchar(255)
  ingredient_quantity?: string; // Nullable, varchar(20)
  ingredient_id?: number; // Non-nullable, int
  product_id?: number; // Nullable, int
  product_name?: string; // Nullable, varchar(255)
  product_brand?: string; // Nullable, varchar(255)
  product_purchased_from?: string; // Nullable, varchar(255)
  product_link?: string; // Nullable, varchar(255)
  product_img?: string; // Nullable, varchar(255)
}

interface RecipeTag extends RowDataPacket {
  recipe_id: number; // Non-nullable, int
  tag_id: number; // Non-nullable, int, with default 0
  tag_name: string; // Non-nullable, varchar(100)
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

interface RecipeImgs extends RowDataPacket {
  recipe_img: string; // Non-nullable, varchar(255)
}

interface RecipeProduct {
  id: number;
  name: string;
  brand: string | null;
  purchasedFrom: string | null;
  link: string | null;
  img: string | null;
}

interface Ingredient {
  id: number;
  name: string;
  quantity: string;
  ingredientId: number | null;
  userProduct: RecipeProduct | null;
  products: ClientProduct[] | null;
}

interface ClientRecipeDetail {
  id: number;
  name: string;
  description: string;
  hours: number;
  minutes: number;
  steps: string[];
  img: string;
  ingredients: Ingredient[];
  tags: { id: number; name: string }[];
  user: { id: number; username: string; img: string | null };
}

type EditRecipe = INewRecipe & { id: number };

router.get("/:recipeId", async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    if (!validateId(recipeId)) {
      return res.status(400).json({ error: "Invalid recipe ID" });
    }

    const [recipe_info] = await mysqlDB.query<RecipeInfo[]>(
      `SELECT * FROM recipes where recipes.id = ${recipeId}`
    );

    if (!recipe_info)
      return res.status(404).json({ error: "Recipe not found" });

    const [[imgs], [ingredients_data], [tags_data], [user_data]] =
      await Promise.all([
        mysqlDB.query<RecipeImgs[]>(
          `SELECT recipe_img FROM recipe_img_view WHERE recipe_id = ?`,
          [recipeId]
        ),
        mysqlDB.query<RecipeIngredient[]>(
          `SELECT * FROM recipe_ingredients_view WHERE recipe_id = ?`,
          [recipeId]
        ),
        mysqlDB.query<RecipeTag[]>(
          `SELECT * FROM recipe_tags_view WHERE recipe_id = ?`,
          [recipeId]
        ),
        mysqlDB.query<UserSimple[]>(
          `SELECT * FROM users_simple_view WHERE id = ?`,
          [recipe_info[0].user_id]
        ),
      ]);

    const getProducts = async (ingredientId: number, productId?: number) => {
      const [productsData] = await mysqlDB.query<Product[]>(
        `SELECT * FROM ingredient_products
         JOIN product_detail_view ON product_detail_view.id = ingredient_products.product_id
         WHERE ingredient_id = ? AND product_detail_view.id != ?
         LIMIT 5`,
        [ingredientId, productId]
      );

      const products: ClientProduct[] = productsData.map((product) => ({
        id: product.id,
        ingredientId: product.ingredient_id,
        userId: product.user_id,
        name: product.name,
        brand: product.brand,
        purchasedFrom: product.purchased_from,
        link: product.link,
        img: config.img.dbUrl + product.img,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }));

      return products;
    };

    const ingredientsProducts = await Promise.all(
      ingredients_data.map(async (ingredient) => {
        if (!ingredient.ingredient_id) {
          return { ingredientId: null, products: null };
        }

        const products = await getProducts(
          ingredient.ingredient_id,
          ingredient.product_id
        );
        return { ingredientId: ingredient.ingredient_id, products };
      })
    );

    const IngredientIdAndProductsMap = ingredientsProducts.reduce(
      (map, { ingredientId, products }) => {
        if (ingredientId) map[ingredientId] = products;

        return map;
      },
      {} as { [ingredientId: number]: ClientProduct[] | null }
    );

    const ingredients: Ingredient[] = ingredients_data.map(
      (ingredient_data) => ({
        id: ingredient_data.id,
        name: ingredient_data.ingredient_name,
        quantity: ingredient_data.ingredient_quantity ?? "",
        ingredientId: ingredient_data.ingredient_id ?? null,
        userProduct: ingredient_data.product_id
          ? {
              id: ingredient_data.product_id,
              name: ingredient_data.product_name ?? "",
              brand: ingredient_data.product_brand ?? null,
              purchasedFrom: ingredient_data.product_purchased_from ?? null,
              link: ingredient_data.product_link ?? null,
              img: ingredient_data.product_img
                ? config.img.dbUrl + ingredient_data.product_img
                : null,
            }
          : null,
        products: ingredient_data.ingredient_id
          ? IngredientIdAndProductsMap[ingredient_data.ingredient_id]
          : null,
      })
    );

    const info = recipe_info[0];
    const user = user_data[0];

    const recipe: ClientRecipeDetail = {
      id: info.id,
      name: info.name,
      description: info.description ?? "",
      hours: info.hours,
      minutes: info.minutes,
      steps: info.steps ? info.steps : [],
      img: config.img.dbUrl + imgs[0].recipe_img,
      ingredients,
      tags: tags_data.map((tag) => ({ id: tag.tag_id, name: tag.tag_name })),
      user: {
        id: user.id,
        username: user.username,
        img: user.img ? config.img.dbUrl + user.img : "",
      },
    };

    return res.status(200).json(recipe);
  } catch (e) {
    next(e);
  }
});

router.delete("/:recipeId", authGuard, async (req, res, next) => {
  const connection = await mysqlDB.getConnection();

  try {
    const { recipeId } = req.params;

    if (!validateId(recipeId))
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

router.put("/:recipeId", authGuard, upload.any(), async (req, res, next) => {
  const connection = await mysqlDB.getConnection();
  try {
    const { recipeId } = req.params;

    if (!validateId(recipeId))
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

    const updates = new Map<string, any>();
    if (info.name !== currentRecipe.name) updates.set("name", info.name);
    if (Number(info.hours) !== currentRecipe.hours)
      updates.set("hours", Number(info.hours));
    if (Number(info.minutes) !== currentRecipe.minutes)
      updates.set("minutes", Number(info.minutes));
    if (info.description !== currentRecipe.description)
      updates.set("description", info.description);
    if (info.steps?.join("") !== currentRecipe.steps?.join(""))
      updates.set("steps", info.steps);

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

    if (info.tags.length) {
      const [existingTags] = await connection.query<RowDataPacket[]>(
        `SELECT name FROM tags WHERE id IN (SELECT tag_id FROM recipe_tags WHERE recipe_id = ?)`,
        [recipeId]
      );

      const existingTagsNames = existingTags.map((tag) => tag.name);

      const newTags = info.tags;
      const tagsToAdd = newTags.filter(
        (tag) => !existingTagsNames.includes(tag)
      );
      const tagsToRemove = existingTagsNames.filter(
        (tag) => !newTags.includes(tag)
      );

      // Remove only unnecessary tags
      if (tagsToRemove.length) {
        const [tagsIds] = await connection.query<RowDataPacket[]>(
          `SELECT id FROM tags WHERE name IN (?)`,
          [tagsToRemove]
        );

        const tagIdsArray = tagsIds.map((tag) => tag.id);
        const placeholders = tagIdsArray.map(() => "?").join(", ");

        await connection.execute(
          `DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id IN (${placeholders})`,
          [recipeId, ...tagIdsArray]
        );
      }

      // Insert only new tags
      if (tagsToAdd.length) {
        await connection.execute(
          `INSERT IGNORE INTO tags (user_id, name) VALUES ${tagsToAdd
            .map(() => "(?, ?)")
            .join(", ")}`,
          tagsToAdd.flatMap((tag) => [userId, tag])
        );

        const [tagsIds] = await connection.query<RowDataPacket[]>(
          `SELECT id FROM tags WHERE name IN (?)`,
          [tagsToAdd]
        );

        await connection.execute(
          `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${tagsToAdd
            .map(() => `(${recipeId}, ?)`)
            .join(", ")}`,
          tagsIds.map((tag) => tag.id)
        );
      }
    }

    // ingredients

    const ingredientNames = info.ingredients.map((ingredient) =>
      ingredient.name.toLowerCase()
    );

    if (info.ingredients.length) {
      await connection.execute(
        `INSERT IGNORE INTO ingredients (name, user_id) VALUES ${info.ingredients
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

    res
      .status(200)
      .json({ message: "Recipe updated successfully", id: recipeId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;
