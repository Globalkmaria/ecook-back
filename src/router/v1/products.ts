import { config } from "../../config/index.js";
import mysqlDB from "../../db/mysql.js";
import express from "express";
import { RowDataPacket } from "mysql2";

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

router.get("/", async (req, res, next) => {
  try {
    const { ingredient } = req.query;

    if (!ingredient?.toString().trim()) {
      return res.status(400).json({ error: "Invalid ingredient" });
    }

    const [ingredientData] = await mysqlDB.query<Ingredient[]>(
      `SELECT * FROM ingredients WHERE name = ?`,
      [ingredient]
    );

    const ingredientInfo = ingredientData[0];
    if (!ingredientInfo) {
      return res.json({ ingredientId: null, products: [] });
    }

    const [productsData] = await mysqlDB.query<Product[]>(
      `SELECT * FROM ingredient_products
         JOIN product_detail_view ON product_detail_view.id = ingredient_products.product_id
         WHERE ingredient_id = ?`,
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
      img: config.img.dbUrl + product.img,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.json({ ingredientId: ingredientInfo.id, products });
  } catch (error) {
    next(error);
  }
});

router.get("/:ingredientId", async (req, res, next) => {
  try {
    const { ingredientId } = req.params;

    if (isNaN(Number(ingredientId)))
      return res.status(400).json({ error: "Invalid ingredient ID" });

    const [data] = await mysqlDB.query<Product[]>(
      `SELECT * FROM ingredient_products
        JOIN product_detail_view ON product_detail_view.id = ingredient_products.product_id
        WHERE ingredient_id = ?`,
      [ingredientId] // Pass ingredientId as a parameter
    );

    const products: ClientProduct[] = data.map((product) => ({
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

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

export default router;
