import { RowDataPacket } from "mysql2";

import { INewRecipe } from "../type";
import { ClientProduct } from "../../products/type";

interface IngredientBase {
  id: number; // Primary key, auto_increment
  recipe_id: number; // Non-nullable, int
  ingredient_name: string; // Non-nullable, varchar(255)
  ingredient_quantity?: string; // Nullable, varchar(20)
  ingredient_id: number; // Non-nullable, int
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
  key: string;
  name: string;
  brand: string | null;
  purchasedFrom: string | null;
  link: string | null;
  img: string | null;
}

interface Ingredient {
  id: number;
  key: string;
  name: string;
  quantity: string;
  ingredientId: number | null;
  userProduct: RecipeProduct | null;
  products: ClientRecipeProduct[] | null;
}

export interface ClientRecipeDetail {
  key: string;
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

export type UpdateRecipeServiceParams = {
  recipeId: string;
  userId: number;
  info: EditRecipe;
  filesKeys: Map<string, string>;
};

export interface RecipeInfo extends RowDataPacket {
  id: number; // Primary key, auto_increment
  name: string; // Non-nullable, varchar(50)
  user_id: number; //  foreign key
  hours: number; // Non-nullable, int
  minutes: number; // Non-nullable, int
  description?: string; // Nullable, varchar(255)
  steps: string[]; // Json string[], JSON type in TypeScript as Record<string, any> or object
  created_at: Date; // Timestamp with CURRENT_TIMESTAMP default
  updated_at: Date; // Timestamp with auto-update on change
}

export interface RecipeInfoWithUser extends RecipeInfo {
  recipe_img: string;
  user_id: number;
  user_username: string;
  user_img: string | null;
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

export type EditRecipe = INewRecipe & { id: number };

export interface RecipeRecommendationClientData {
  key: string;
  name: string;
  img: string | null;
  user: {
    username: string;
    img: string | null;
  };
}
