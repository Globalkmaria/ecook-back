import mysqlDB from "../../db/mysql.js";
import express from "express";
import { RowDataPacket } from "mysql2";
import { lightSlugify } from "../../utils/normalize.js";
import { getImgUrl } from "../../utils/img.js";

const router = express.Router();

export interface Product extends RowDataPacket {
  id: number; // Primary key for the ingredient
  ingredient_id: number; // Foreign key referencing ingredient
  product_id: number; // Foreign key referencing product
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
  ingredientId: number;
  userId: number;
  name: string;
  brand: string;
  purchasedFrom: string;
  link: string | null;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

const QUERY_TYPES = ["ingredientName"];

router.get("/", async (req, res, next) => {
  try {
    const { type, q } = req.query as { type: string; q: string };

    if (!q?.toString().trim()) {
      return res.status(400).json({ error: "Invalid query" });
    }

    if (typeof type === "string" && !QUERY_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid query type" });
    }

    if (type === "ingredientName") {
      const [ingredientData] = await mysqlDB.query<Ingredient[]>(
        `SELECT * FROM ingredients WHERE name = ?`,
        [lightSlugify(q)]
      );

      const ingredientInfo = ingredientData[0];
      if (!ingredientInfo) {
        return res.json({ ingredientId: null, products: [] });
      }

      const [productsData] = await mysqlDB.query<Product[]>(
        `SELECT * FROM ingredient_products
         JOIN product_detail_view ON product_detail_view.id = ingredient_products.product_id
         WHERE ingredient_id = ? ORDER BY product_detail_view.created_at DESC
         `,
        [ingredientInfo.id]
      );

      const products: ClientProduct[] = productsData.map((product) => ({
        id: product.id,
        ingredientId: product.ingredient_id,
        userId: product.user_id,
        name: product.name,
        brand: product.brand,
        purchasedFrom: product.purchased_from,
        link: product.link,
        img: getImgUrl(product.img, true),
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }));

      res.json({ ingredientId: ingredientInfo.id, products });
    } else {
      res.status(400).json({ error: "Invalid query type" });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
