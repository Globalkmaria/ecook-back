import express from "express";
import { RowDataPacket } from "mysql2";

import mysqlDB2 from "../../../db/mysql2.js";
import mysqlDB from "../../../db/mysql.js";

import recipeRouter from "../recipes/recipe/recommend.js";

import { getImgUrl } from "../../../utils/img.js";
import { generateRecipeKey } from "../recipes/helper.js";
import { RecommendRecipe } from "./type.js";

interface Recommend extends RowDataPacket {
  id: number;
  page: string;
  type: string;
  value: string;
  label: string;
}

const router = express.Router();

router.get("/home", async (req, res, next) => {
  try {
    const [types] = await mysqlDB2.query<Recommend[]>(
      `SELECT * FROM recommend WHERE page='home' AND type='tag';`
    );

    if (types.length === 0) {
      return res.status(200).json([]);
    }

    const recipesPromises = types.map((type) =>
      mysqlDB.query<RecommendRecipe[]>(
        `WITH limited_filtered_recipes AS (
          SELECT tag_id, recipe_id, recipes.name as recipe_name, recipes.user_id as user_id
          FROM (
              SELECT *
              FROM recipe_tags
              WHERE tag_id = ?
            ) AS filtered_recipe_tags
            JOIN recipes ON recipes.id = filtered_recipe_tags.recipe_id
            ORDER BY recipes.created_at DESC
            LIMIT 5
          )
          SELECT recipes.recipe_id , recipes.recipe_name, img.recipe_img as recipe_img, user.username as user_username, user.img as user_img
          FROM limited_filtered_recipes as recipes
          JOIN recipe_img_view img ON recipes.recipe_id = img.recipe_id
          JOIN users_simple_view user ON user.id = recipes.user_id;
        `,
        [Number(type.value)]
      )
    );

    const recipes = await Promise.all(recipesPromises);

    const result = types.map((type, i) => {
      const typeRecipes = recipes[i][0].map((recipe) => {
        const key = generateRecipeKey(recipe.recipe_id, recipe.recipe_name);
        return {
          name: recipe.recipe_name,
          img: getImgUrl(recipe.recipe_img, true),
          user: {
            username: recipe.user_username,
            img: getImgUrl(recipe.user_img, true),
          },
          key,
        };
      });

      return {
        type: type.label,
        recipes: typeRecipes,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.use("/recipes", recipeRouter);

export default router;
