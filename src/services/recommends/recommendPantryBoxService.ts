import mysqlDB from "../../db/mysql";

import { RecommendRecipe } from "./type";

export const getIngredientRecommendRecipes = async (
  ingredientId: number,
  limit = 10
) => {
  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    SELECT 
        r.id as recipe_id, 
        r.name as recipe_name, 
        img.recipe_img as recipe_img, 
        user.username as user_username, 
        user.img as user_img
    FROM recipes r
    JOIN recipe_ingredients ri
        ON r.id = ri.recipe_id
    JOIN recipe_img_view img 
        ON r.id = img.recipe_id
    JOIN users_simple_view user 
        ON user.id = r.user_id
    WHERE ri.ingredient_id = ?
    ORDER BY r.created_at DESC
    LIMIT ${limit}
        ;
      `,
    [ingredientId]
  );

  return recipes;
};

export const getIngredientAndProductRecommendRecipes = async (
  ingredientId: number,
  productId: number,
  limit = 10
) => {
  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    SELECT 
        r.id as recipe_id, 
        r.name as recipe_name, 
        img.recipe_img as recipe_img, 
        user.username as user_username, 
        user.img as user_img
    FROM recipes r
    JOIN recipe_ingredients ri
        ON r.id = ri.recipe_id
    JOIN recipe_img_view img 
        ON r.id = img.recipe_id
    JOIN users_simple_view user 
        ON user.id = r.user_id
    WHERE ri.ingredient_id = ? OR ri.product_id =?
    ORDER BY r.created_at DESC
    LIMIT ${limit}
        ;
      `,
    [ingredientId, productId]
  );

  return recipes;
};
