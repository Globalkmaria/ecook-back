import mysqlDB from "../../../db/mysql.js";
import { decryptRecipeURLAndGetRecipeId } from "../utils.js";
import { RecommendRecipe } from "../../recommends/type.js";
import { validateId } from "../../../utils/numbers.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { RecipeInfo } from "./type.js";

export const getRecipeInfo = async (key: string) => {
  const recipeId = decryptRecipeURLAndGetRecipeId(key);

  if (!recipeId || !validateId(recipeId))
    throw new ServiceError(400, "Invalid recipe ID");

  const [recipes] = await mysqlDB.query<RecipeInfo[]>(
    `SELECT * FROM recipes where recipes.id = ${recipeId}`
  );

  if (!recipes.length) throw new ServiceError(404, "Recipe not found");

  return recipes[0];
};

export const getUserRecipes = async (recipe: RecipeInfo) => {
  const [result] = await mysqlDB.query<RecommendRecipe[]>(
    `WITH filtered_recipes AS
        (SELECT * FROM recipes 
            WHERE user_id = ${recipe.user_id} 
            AND recipes.id != ${recipe.id} 
            ORDER BY created_at DESC
            LIMIT 8
        )
    SELECT 
      recipes.id as recipe_id, 
      recipes.name as recipe_name, 
      img.recipe_img as recipe_img, 
      user.username as user_username, 
      user.img as user_img
    FROM filtered_recipes as recipes
    JOIN recipe_img_view img ON recipes.id = img.recipe_id
    JOIN users_simple_view user ON user.id = recipes.user_id;
    `
  );
  return result;
};

export const getIngredientRecipes = async (recipe: RecipeInfo) => {
  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    WITH filtered_recipes AS
      (
        SELECT DISTINCT 
          recipes.id as recipe_id, 
          recipes.name as recipe_name, 
          recipes.user_id as user_id, 
          recipes.created_at
        FROM recipe_ingredients
        JOIN recipes 
          ON recipes.id = recipe_ingredients.recipe_id
        JOIN (
            SELECT * FROM recipe_ingredients
            WHERE recipe_ingredients.recipe_id = ? 
        ) as filtered_recipe_ingredients
          ON filtered_recipe_ingredients.recipe_id = recipes.id
        WHERE recipes.id != ?
        ORDER BY created_at DESC
        LIMIT 8
      )
    SELECT 
      recipes.recipe_id, 
      recipes.recipe_name, 
      img.recipe_img as recipe_img, 
      user.username as user_username, 
      user.img as user_img
    FROM filtered_recipes recipes
    JOIN recipe_img_view img 
      ON recipes.recipe_id = img.recipe_id
    JOIN users_simple_view user 
      ON user.id = recipes.user_id;
    `,
    [recipe.id, recipe.id]
  );

  return recipes;
};

export const getTagRecipes = async (recipe: RecipeInfo) => {
  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    WITH filtered_recipes AS
    (
        SELECT DISTINCT 
          recipes.id as recipe_id, 
          recipes.name as recipe_name, 
          recipes.user_id as user_id, 
          recipes.created_at
        FROM recipe_tags
        JOIN recipes 
          ON recipes.id = recipe_tags.recipe_id
        JOIN (
            SELECT * FROM recipe_tags
            WHERE recipe_tags.recipe_id = ?
        ) as filtered_recipe_tags
          ON filtered_recipe_tags.tag_id = recipe_tags.tag_id
        WHERE recipes.id != ?
        ORDER BY created_at DESC 
        LIMIT 8
    )
    SELECT 
      recipes.recipe_id, 
      recipes.recipe_name, 
      img.recipe_img as recipe_img, 
      user.username as user_username, 
      user.img as user_img
    FROM filtered_recipes as recipes
    JOIN recipe_img_view img 
      ON recipes.recipe_id = img.recipe_id
    JOIN users_simple_view user 
      ON user.id = recipes.user_id
    ;
        `,
    [recipe.id, recipe.id]
  );
  return recipes;
};

export const getRecentRecipes = async () => {
  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    SELECT 
      r.id as recipe_id, 
      r.name as recipe_name, 
      r.recipe_img, 
      r.user_username, 
      r.user_img
    FROM recipe_with_user_info_view r
    ORDER BY r.created_at DESC
    LIMIT 8
    ;
    `
  );
  return recipes;
};
