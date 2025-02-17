import { RowDataPacket } from "mysql2";

export interface Ingredient extends RowDataPacket {
  id: number;
  user_id?: number | null;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface IngredientProduct {
  ingredient_id: number;
  ingredient_name: string;
  product_id: number;
  product_name: string;
  product_brand: string;
  product_purchased_from: string;
  product_img: string;
}

export type SimpleIngredient = Pick<
  IngredientProduct,
  "ingredient_id" | "ingredient_name"
>;
