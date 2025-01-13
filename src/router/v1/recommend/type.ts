import { RowDataPacket } from "mysql2";

export interface RecommendRecipe extends RowDataPacket {
  recipe_id: number;
  recipe_name: string;
  recipe_img: string;
  user_username: string;
  user_img: string;
}
