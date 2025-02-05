import express from "express";
import { RowDataPacket } from "mysql2";

import mysqlDB from "../../../db/mysql.js";
import { lightSlugify, lightTrim } from "../../../utils/normalize.js";
import { getImgUrl } from "../../../utils/img.js";
import { User } from "../recipes/recipe/recipe.js";
import {
  decryptRecipeURLAndGetProductId,
  generateProductKey,
} from "./helper.js";
import { arrayToPlaceholders } from "../../../utils/query.js";

const router = express.Router();

export interface Product extends RowDataPacket {
  id: number; // Primary key for the ingredient
  ingredient_id: number; // Foreign key referencing ingredient
  ingredient_name: string;
  user_id: number; // Foreign key referencing user
  name: string; // Name of the product or ingredient
  brand: string; // Brand of the product
  purchased_from: string; // Where the product was purchased from
  link: string | null; // Optional link for product details (can be null)
  created_at: Date; // Timestamp for when the record was created
  updated_at: Date; // Timestamp for when the record was updated
  img: string; // URL to the product image
}

interface Ingredient extends RowDataPacket {
  id: number; // Corresponds to 'int' and is the primary key
  user_id?: number | null; // 'int' and nullable, thus optional
  name: string; // Corresponds to 'varchar(255)' and is required
  created_at?: Date; // 'timestamp' and nullable, so it's optional
  updated_at?: Date; // 'timestamp' and nullable, so it's optional
}

interface IngredientProducts extends RowDataPacket {
  id: number;
  ingredient_id: number;
  product_id: number;
}

export interface ClientProduct {
  id: number;
  ingredient: {
    id: number;
    name: string;
  };
  userId: number;
  name: string;
  brand: string;
  purchasedFrom: string;
  link: string | null;
  img: string;
  createdAt: Date;
  updatedAt: Date;
  key: string;
}

const QUERY_TYPES = {
  INGREDIENT_NAME: "ingredientName",
  USERNAME: "username",
  PRODUCT_KEY: "productKey",
};

const QUERY_TYPES_VALUES = Object.values(QUERY_TYPES);

router.get("/", async (req, res, next) => {
  try {
    const { type, q } = req.query as { type: string; q: string };

    if (!q?.toString().trim()) {
      return res.status(400).json({ error: "Invalid query" });
    }

    if (!QUERY_TYPES_VALUES.includes(type)) {
      return res.status(400).json({ error: "Invalid query type" });
    }

    let data: Product[] = [];
    let ingredientId: number | null = null;

    switch (type) {
      case QUERY_TYPES.INGREDIENT_NAME:
        const [exactIngredientData] = await mysqlDB.query<Ingredient[]>(
          `SELECT * FROM ingredients WHERE name = ?`,
          [lightSlugify(q)]
        );

        ingredientId = exactIngredientData[0]?.id;

        const searchQuery = `%${lightSlugify(q)}%`;

        const [ingredientData] = await mysqlDB.query<Ingredient[]>(
          `SELECT * FROM ingredients WHERE name LIKE ?`,
          [searchQuery]
        );

        if (!ingredientData.length) {
          return res.json([]);
        }

        const ingredientIds = ingredientData.map((ingredient) => ingredient.id);
        const ingredientPlaceholder = arrayToPlaceholders(ingredientIds);

        [data] = await mysqlDB.query<Product[]>(
          `SELECT DISTINCT p.*, i.id ingredient_id, i.name ingredient_name
              FROM ingredient_products ip
              JOIN product_detail_view p ON p.id = ip.product_id
              JOIN ingredients i ON i.id = ip.ingredient_id
              WHERE i.id IN (${ingredientPlaceholder}) 
              ORDER BY p.created_at DESC;
           `,
          [...ingredientIds]
        );

        break;

      case QUERY_TYPES.USERNAME:
        const [userData] = await mysqlDB.query<User[]>(
          `SELECT * FROM users WHERE username = ?`,
          [lightTrim(q)]
        );

        if (!userData.length) {
          return res.json([]);
        }

        [data] = await mysqlDB.query<Product[]>(
          `SELECT DISTINCT p.*, ri.ingredient_id, ri.name as ingredient_name
            FROM product_detail_view p
            JOIN recipe_ingredients ri ON p.id = ri.product_id
            JOIN recipes r ON ri.recipe_id = r.id
            WHERE r.user_id = ? 
              AND ri.product_id IS NOT NULL
            ORDER BY p.created_at DESC;
          `,
          [userData[0].id]
        );

        break;

      case QUERY_TYPES.PRODUCT_KEY:
        const productId = decryptRecipeURLAndGetProductId(q);

        const [ingredients] = await mysqlDB.query<IngredientProducts[]>(
          `SELECT ingredient_id FROM ingredient_products WHERE product_id = ?`,
          [productId]
        );

        if (!ingredients.length) {
          return res.json([]);
        }

        ingredientId = ingredients[0].ingredient_id;

        [data] = await mysqlDB.query<Product[]>(
          `SELECT DISTINCT p.*, i.id ingredient_id, i.name ingredient_name
              FROM ingredient_products ip
              JOIN product_detail_view p ON p.id = ip.product_id
              JOIN ingredients i ON i.id = ip.ingredient_id
              WHERE i.id = ? AND p.id != ?
              ORDER BY p.created_at DESC;
           `,
          [ingredientId, productId]
        );

        break;

      default:
        return res.status(400).json({ error: "Invalid query type" });
    }

    const products: ClientProduct[] = data.map((product) => ({
      id: product.id,
      ingredient: {
        id: product.ingredient_id,
        name: product.ingredient_name,
      },
      userId: product.user_id,
      name: product.name,
      brand: product.brand,
      purchasedFrom: product.purchased_from,
      link: product.link,
      img: getImgUrl(product.img, true),
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      key: generateProductKey(product.id, product.name),
    }));

    res.json({
      ingredientId,
      products,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
