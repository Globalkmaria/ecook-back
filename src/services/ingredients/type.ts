import { RowDataPacket } from "mysql2";

export interface Ingredient extends RowDataPacket {
  id: number; // Corresponds to 'int' and is the primary key
  user_id?: number | null; // 'int' and nullable, thus optional
  name: string; // Corresponds to 'varchar(255)' and is required
  created_at?: Date; // 'timestamp' and nullable, so it's optional
  updated_at?: Date; // 'timestamp' and nullable, so it's optional
}

export type IngredientProductQueryResult = {
  ingredient_id: number;
  ingredient_name: string;
  product_id: number;
  product_name: string;
  product_brand: string;
  product_purchased_from: string;
  product_img: string;
};
