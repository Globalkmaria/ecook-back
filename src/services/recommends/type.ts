import { RowDataPacket } from "mysql2";

export interface Recommend extends RowDataPacket {
  id: number;
  page: string;
  type: string;
  value: string;
  label: string;
  order: number;
}
export interface RecommendRecipe extends RowDataPacket {
  recipe_id: number;
  recipe_name: string;
  recipe_img: string;
  user_username: string;
  user_img: string;
  user_deleted_at: Date | null;
}

export type RecommendRecipeWithOption = {
  option_name: string;
} & RecommendRecipe;

export type HomeRecommendRecipe = {
  option: string;
  name: string;
  img: string;
  user: {
    username: string;
    img?: string;
  };
  key: string;
};
