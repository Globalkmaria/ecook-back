import { RowDataPacket } from "mysql2";

export interface RecipesSimple extends RowDataPacket {
  id: number; // Non-nullable, int, default 0
  name: string; // Non-nullable, varchar(50)
  created_at: Date; // Timestamp for when the record was created
  updated_at: Date; // Timestamp for when the record was updated
  img: string; // Non-nullable, varchar(255)
  user_img?: string | null; // Nullable, varchar(255)
  user_username: string; //  varchar(100)
  user_id: number; // Non-nullable, int, default 0
  user_deleted_at: Date | null; // Timestamp, default NULL
  tag_ids?: string | null; // Nullable, text (could store a list of tag IDs as a string)
  tag_names?: string | null; // Nullable, text (could store a list of tag names as a string)
  hours: number; // Non-nullable, int, default 0
  minutes: number; // Non-nullable, int, default 0
}

export interface ClientRecipeSimple {
  id: number;
  name: string;
  img: string;
  tags: { name: string }[];
}

export interface IngredientNewProduct {
  name: string;
  brand: string | null;
  purchasedFrom: string | null;
  link: string | null;
  img: File | null;
  id: string | null;
}
interface NewRecipeIngredient {
  name: string;
  quantity: string;
  ingredientId: number | null;
  productId: number | null;
  newProduct: IngredientNewProduct | null;
}

export interface INewRecipe {
  name: string;
  description: string;
  hours: number;
  minutes: number;
  steps: string[];
  ingredients: NewRecipeIngredient[];
  tags: string[];
}
