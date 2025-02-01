import { RowDataPacket } from "mysql2";

export interface RecommendRecipe extends RowDataPacket {
  recipe_id: number;
  recipe_name: string;
  recipe_img: string;
  user_username: string;
  user_img: string;
  option_name: string;
}

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
