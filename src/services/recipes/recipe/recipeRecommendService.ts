import { RowDataPacket } from "mysql2";

import mysqlDB from "../../../db/mysql.js";
import { decryptRecipeURLAndGetRecipeId } from "./helper.js";
import { RecommendRecipe } from "../../recommends/type.js";
import { validateId } from "../../../utils/numbers.js";
import { arrayToPlaceholders } from "../../../utils/query.js";
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
    SELECT recipes.id as recipe_id, recipes.name as recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
    FROM filtered_recipes as recipes
    JOIN recipe_img_view img ON recipes.id= img.recipe_id
    JOIN users_simple_view user ON user.id = recipes.user_id;
    `
  );
  return result;
};

export const getIngredientRecipes = async (recipe: RecipeInfo) => {
  const [ingredient_ids] = await mysqlDB.query<
    ({ ingredient_id: string } & RowDataPacket)[]
  >(
    `SELECT ingredient_id FROM recipe_ingredients
    WHERE recipe_ingredients.recipe_id = ${recipe.id} 
    LIMIT 8;
      `
  );

  const ingredientIds = ingredient_ids
    .map((ingredient) => ingredient.ingredient_id)
    .slice(0, 8);

  const ingredientPlaceholders = arrayToPlaceholders(ingredientIds);

  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    WITH filtered_recipes AS
        (
          SELECT DISTINCT recipes.id as recipe_id, recipes.name as recipe_name, recipes.user_id as user_id, recipes.created_at
          FROM recipes 
          JOIN (
              SELECT * FROM recipe_ingredients
              WHERE recipe_ingredients.ingredient_id IN (${ingredientPlaceholders})
            ) as recipe_ingredients
          ON recipe_ingredients.recipe_id = recipes.id
          WHERE recipes.id != ${recipe.id} 
        )
    SELECT recipes.recipe_id , recipes.recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
    FROM  (
          SELECT *
          FROM filtered_recipes
          ORDER BY created_at DESC 
          LIMIT 8
        ) as recipes
    JOIN recipe_img_view img ON recipes.recipe_id = img.recipe_id
    JOIN users_simple_view user ON user.id = recipes.user_id;
      `,
    [...ingredientIds]
  );

  return recipes;
};

export const getTagRecipes = async (recipe: RecipeInfo) => {
  const [ids] = await mysqlDB.query<RowDataPacket[]>(
    `SELECT tag_id FROM recipe_tags
        WHERE recipe_tags.recipe_id = ${recipe.id} 
        LIMIT 5;
    `
  );

  if (!ids.length) return [];

  const tagIds = ids.map((tag) => tag.tag_id);
  const tagPlaceholders = arrayToPlaceholders(tagIds);

  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    WITH filtered_recipes AS
    (
        SELECT DISTINCT recipes.id as recipe_id, recipes.name as recipe_name, recipes.user_id as user_id, recipes.created_at
        FROM recipes 
        JOIN (
            SELECT * FROM recipe_tags
            WHERE recipe_tags.tag_id IN (${tagPlaceholders})
        ) as recipe_tags
        ON recipe_tags.recipe_id = recipes.id
        WHERE recipes.id != ${recipe.id} 
    )
    SELECT recipes.recipe_id , recipes.recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
    FROM  (
        SELECT *
        FROM filtered_recipes
        ORDER BY created_at DESC 
        LIMIT 8
        ) as recipes
    JOIN recipe_img_view img ON recipes.recipe_id = img.recipe_id
    JOIN users_simple_view user ON user.id = recipes.user_id;
        `,
    [...tagIds]
  );
  return recipes;
};

export const getRecentRecipes = async () => {
  const [recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `
    SELECT r.id as recipe_id, r.name as recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
        FROM (
            SELECT *
            FROM recipes
            ORDER BY recipes.created_at DESC
            LIMIT 8
        ) r
        JOIN recipe_img_view img 
            ON r.id = img.recipe_id
        JOIN users_simple_view user 
            ON user.id = r.user_id
    ;
    `
  );
  return recipes;
};
