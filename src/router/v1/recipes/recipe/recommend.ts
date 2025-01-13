import express from "express";
import { RowDataPacket } from "mysql2";

import mysqlDB from "../../../../db/mysql.js";
import { validateId } from "../../../../utils/numbers.js";
import { arrayToPlaceholders } from "../../../../utils/query.js";
import { RecipeInfo } from "./recipe.js";
import { decryptRecipeURLAndGetRecipeId, getUniqueRecipes } from "./helper.js";
import { RecommendRecipe } from "../../recommend/type.js";

const router = express.Router();

router.get("/:key/recommend", async (req, res, next) => {
  try {
    const recipeId = decryptRecipeURLAndGetRecipeId(req.params.key);

    if (!recipeId || !validateId(recipeId))
      return res.status(400).json({ error: "Invalid recipe ID" });

    const [recipe] = await mysqlDB.query<RecipeInfo[]>(
      `SELECT * FROM recipes where recipes.id = ${recipeId}`
    );

    if (!recipe) return res.status(400).json({ error: "Recipe not found" });

    const result: RecommendRecipe[] = [];

    // user recipes
    const [user_recipes] = await mysqlDB.query<RecommendRecipe[]>(
      `WITH filtered_recipes AS
        (SELECT * FROM recipes 
            WHERE user_id = ${recipe[0].user_id} 
            AND recipes.id != ${recipeId} 
            LIMIT 8
        )
    SELECT recipes.id as recipe_id, recipes.name as recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
    FROM filtered_recipes as recipes
    JOIN recipe_img_view img ON recipes.id= img.recipe_id
    JOIN users_simple_view user ON user.id = recipes.user_id;
    `
    );
    result.push(...user_recipes);

    // ingredient recipes
    const [ingredient_ids] = await mysqlDB.query<RowDataPacket[]>(
      `SELECT ingredient_id FROM recipe_ingredients
        WHERE recipe_ingredients.recipe_id = ${recipeId} 
    LIMIT 8;
    `
    );

    const ingredientIds = ingredient_ids.map(
      (ingredient) => ingredient.ingredient_id
    );
    const ingredientPlaceholders = arrayToPlaceholders(ingredientIds);

    const [ingredient_recipes] = await mysqlDB.query<RecommendRecipe[]>(
      `
    WITH filtered_recipes AS
        (SELECT DISTINCT recipes.id as recipe_id, recipes.name as recipe_name, recipes.user_id as user_id
            FROM recipes 
            JOIN (
                SELECT * FROM recipe_ingredients
                WHERE recipe_ingredients.ingredient_id IN (${ingredientPlaceholders})
                ) as recipe_ingredients
            ON recipe_ingredients.recipe_id = recipes.id
            LIMIT 8
        )
    SELECT recipes.recipe_id , recipes.recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
    FROM filtered_recipes as recipes
    JOIN recipe_img_view img ON recipes.recipe_id = img.recipe_id
    JOIN users_simple_view user ON user.id = recipes.user_id;
			`,
      [...ingredientIds]
    );
    result.push(...ingredient_recipes);

    // tag recipes
    const [tag_ids] = await mysqlDB.query<RowDataPacket[]>(
      `SELECT tag_id FROM recipe_tags
        WHERE recipe_tags.recipe_id = ${recipeId} 
    LIMIT 5;
    `
    );
    const tagIds = tag_ids.map((tag) => tag.tag_id);
    const tagPlaceholders = arrayToPlaceholders(tagIds);

    const [tag_recipes] = await mysqlDB.query<RecommendRecipe[]>(
      `
    WITH filtered_recipes AS
        (SELECT DISTINCT recipes.id as recipe_id, recipes.name as recipe_name, recipes.user_id as user_id
            FROM recipes 
            JOIN (
                SELECT * FROM recipe_tags
                WHERE recipe_tags.tag_id IN (${tagPlaceholders})
                ) as recipe_tags
            ON recipe_tags.recipe_id = recipes.id
            LIMIT 8
        )
    SELECT recipes.recipe_id , recipes.recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
    FROM filtered_recipes as recipes
    JOIN recipe_img_view img ON recipes.recipe_id = img.recipe_id
    JOIN users_simple_view user ON user.id = recipes.user_id;
			`,
      [...tagIds]
    );

    result.push(...tag_recipes);

    const uniqueRecipes = getUniqueRecipes(result, 8);

    res.status(200).json(uniqueRecipes);
  } catch (error) {
    next(error);
  }
});

export default router;
