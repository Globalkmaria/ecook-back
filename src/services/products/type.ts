import { RowDataPacket } from "mysql2";

import { PRODUCT_QUERY_TYPES } from "../../controllers/products/const";
import { GetProductsResponse } from "../../controllers/products/productsController";

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

export interface SearchProductsParams {
  type: ProductQueryTypes;
  query: string;
}

export interface SearchProductsData {
  products: Product[];
  ingredientId: GetProductsResponse["ingredientId"];
}

export interface ClientProduct {
  id: number;
  ingredient: {
    id: number;
    name: string;
    key: string;
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

export type ProductQueryTypes =
  (typeof PRODUCT_QUERY_TYPES)[keyof typeof PRODUCT_QUERY_TYPES];
