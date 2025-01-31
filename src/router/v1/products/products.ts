import mysqlDB from "../../../db/mysql.js";
import express from "express";
import { RowDataPacket } from "mysql2";
import { lightSlugify, lightTrim } from "../../../utils/normalize.js";
import { getImgUrl } from "../../../utils/img.js";
import { User } from "../recipes/recipe/recipe.js";
import { generateProductKey } from "./helper.js";

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

const QUERY_TYPES = ["ingredientName", "username"];

router.get("/", async (req, res, next) => {
  try {
    const { type, q } = req.query as { type: string; q: string };

    if (!q?.toString().trim()) {
      return res.status(400).json({ error: "Invalid query" });
    }

    if (!QUERY_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid query type" });
    }

    let data: Product[] = [];

    switch (type) {
      case "ingredientName":
        const [ingredientData] = await mysqlDB.query<Ingredient[]>(
          `SELECT * FROM ingredients WHERE name = ?`,
          [lightSlugify(q)]
        );

        const ingredientInfo = ingredientData[0];
        if (!ingredientInfo) {
          return res.json([]);
        }

        [data] = await mysqlDB.query<Product[]>(
          `SELECT DISTINCT p.*, i.id ingredient_id, i.name ingredient_name
              FROM ingredient_products ip
              JOIN product_detail_view p ON p.id = ip.product_id
              JOIN ingredients i ON i.id = ip.ingredient_id
              WHERE i.id = ? 
              ORDER BY p.created_at DESC;
           `,
          [ingredientInfo.id]
        );

        break;

      case "username":
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

    res.json(products);
  } catch (error) {
    next(error);
  }
});

export default router;
