import { RowDataPacket } from "mysql2";
import { ClientProduct } from "../../../controllers/products/type";

interface IngredientBase {
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

export interface RecipeIngredient extends RowDataPacket, IngredientBase {}

export type RecipeIngredientRequired = Omit<IngredientBase, "ingredient_id"> &
  RowDataPacket & {
    ingredient_id: number;
  };

export interface RecipeTag extends RowDataPacket {
  recipe_id: number; // Non-nullable, int
  tag_id: number; // Non-nullable, int, with default 0
  tag_name: string; // Non-nullable, varchar(100)
}

export interface RecipeImg extends RowDataPacket {
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
  products: ClientRecipeProduct[] | null;
}

export interface ClientRecipeDetail {
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
export type ClientRecipeProduct = Omit<ClientProduct, "ingredient" | "key"> & {
  ingredientId: number;
};
