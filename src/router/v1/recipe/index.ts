import mysqlDB from "../../../db/mysql";
import express from "express";
import { RowDataPacket } from "mysql2";
import { ClientProduct, Product } from "../products";
import { config } from "../../../config";

const router = express.Router();

interface RecipeInfo extends RowDataPacket {
  id: number; // Primary key, auto_increment
  name: string; // Non-nullable, varchar(50)
  user_id: number; //  foreign key
  time?: string; // Nullable, varchar(50)
  description?: string; // Nullable, varchar(255)
  simple_description?: string; // Nullable, varchar(100)
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

interface User extends RowDataPacket {
  id: number; // Primary key, auto_increment
  email: string; // Non-nullable, varchar(255)
  password: string; // Non-nullable, varchar(255)
  first_name?: string; // Nullable, varchar(100)
  last_name?: string; // Nullable, varchar(100)
  username?: string; // Nullable, varchar(100)
  img?: string; // Nullable, varchar(255)
  youtube_link?: string; // Nullable, varchar(255)
  created_at?: Date; // Timestamp, default CURRENT_TIMESTAMP
  updated_at?: Date; // Timestamp, auto-update on change
  instagram_link?: string; // Nullable, varchar(255)
}

interface UserSimple extends RowDataPacket {
  id: number; // Primary key, auto_increment
  first_name?: string; // Nullable, varchar(100)
  username?: string; // Nullable, varchar(100)
  img?: string; // Nullable, varchar(255)
}

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
  simpleDescription: string;
  time: string;
  steps: string[];
  img: string;
  ingredients: Ingredient[];
  tags: { id: number; name: string }[];
  user: { id: number; username: string; img: string | null };
}

router.get("/:recipeId", async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    if (isNaN(Number(recipeId)))
      return res.status(400).json({ error: "Invalid recipe ID" });

    const [recipe_info] = await mysqlDB.query<RecipeInfo[]>(
      `SELECT * FROM recipes where recipes.id = ${recipeId}`
    );

    if (!recipe_info.length)
      return res.status(404).json({ error: "Recipe not found" });

    const [imgs] = await mysqlDB.query<RecipeImgs[]>(
      `SELECT recipe_img FROM recipe_img_view WHERE recipe_id = ${recipeId}`
    );

    const [ingredients_data] = await mysqlDB.query<RecipeIngredient[]>(
      `SELECT * FROM recipe_ingredients_view where recipe_ingredients_view.recipe_id = ${recipeId}`
    );

    const [tags_data] = await mysqlDB.query<RecipeTag[]>(
      `SELECT * FROM recipe_tags_view WHERE recipe_tags_view.recipe_id = ${recipeId}`
    );

    const [user_data] = await mysqlDB.query<UserSimple[]>(
      `SELECT * FROM users_simple_view WHERE users_simple_view.id = ${recipe_info[0].user_id}`
    );

    const getProducts = async (ingredientData: RecipeIngredient) => {
      const { ingredient_id, product_id } = ingredientData;
      if (!ingredient_id) return { ingredientId: null, products: null };
      const [products_data] = await mysqlDB.query<Product[]>(
        `SELECT * FROM ingredient_products
          JOIN
      product_detail_view ON product_detail_view.id = ingredient_products.product_id
          WHERE
      ingredient_id = ${ingredient_id} AND product_detail_view.id != ${product_id}
       LIMIT 5;`
      );

      const products: ClientProduct[] = products_data.map((product) => ({
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

      return { ingredientId: ingredient_id, products };
    };

    const ingredientsProductsPromises = ingredients_data.map(
      (ingredient_data) => getProducts(ingredient_data)
    );

    const ingredientsProducts = await Promise.all(ingredientsProductsPromises);

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
      simpleDescription: info.simple_description ?? "",
      time: info.time ?? "",
      steps: info.steps ? info.steps : [],
      img: config.img.dbUrl + imgs[0].recipe_img,
      ingredients,
      tags: tags_data.map((tag) => ({ id: tag.tag_id, name: tag.tag_name })),
      user: {
        id: user.id,
        username: user.first_name ?? user.username ?? "",
        img: user.img ?? "",
      },
    };

    return res.status(200).json(recipe);
  } catch (e) {
    next(e);
  }
});

export default router;
