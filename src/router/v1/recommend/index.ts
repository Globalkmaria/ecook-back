import express from "express";
import { RowDataPacket } from "mysql2";

import mysqlDB2 from "../../../db/mysql2.js";
import mysqlDB from "../../../db/mysql.js";

import recipeRouter from "../recipes/recipe/recommend.js";

import { HomeRecommendRecipe, RecommendRecipe } from "./type.js";
import { groupRecommendRecipesByOptionName } from "./helper.js";
import { arrayToPlaceholders } from "../../../utils/query.js";

interface Recommend extends RowDataPacket {
  id: number;
  page: string;
  type: string;
  value: string;
  label: string;
}

const router = express.Router();

const recommendType = ["tag", "ingredient"];

router.get("/home", async (req, res, next) => {
  try {
    const result: {
      [K in (typeof recommendType)[number]]: {
        [typeOption: string]: HomeRecommendRecipe[];
      };
    } = {
      tag: {},
      ingredient: {},
    };

    const [tagsData] = await mysqlDB2.query<Recommend[]>(
      `SELECT * FROM recommend WHERE page='home' AND type='tag';`
    );

    if (tagsData.length) {
      const tagValues = tagsData.map((type) => type.value);
      const tagPlaceholder = arrayToPlaceholders(tagValues);
      const [tagRecipes] = await mysqlDB.query<RecommendRecipe[]>(
        `WITH RankedRecipes AS (
          SELECT	
              tag_id, 
              tag_name,
              r.user_id,  
              r.id recipe_id,
              r.name recipe_name,
              ROW_NUMBER() OVER (PARTITION BY tag_id ORDER BY r.id DESC) AS row_num
          FROM (
              SELECT *
              FROM recipe_tags_view
              WHERE tag_id IN (${tagPlaceholder})
          ) AS t
          JOIN recipes r ON r.id = t.recipe_id
      )
      SELECT 
          rr.tag_name option_name, 
          rr.recipe_id, 
          rr.recipe_name,
          r_img.recipe_img, 
          u.username AS user_username, 
          u.img AS user_img
      FROM (
          SELECT *
          FROM RankedRecipes
          WHERE row_num <= 5
      ) AS rr
      JOIN recipe_img_view r_img
          ON rr.recipe_id = r_img.recipe_id
      JOIN users_simple_view u
          ON rr.user_id = u.id;
        `,
        [...tagValues]
      );

      const tagResult = groupRecommendRecipesByOptionName(tagRecipes);
      result.tag = tagResult;
    }
    // ingredient 타입은 레시피 이름을 타입으로 사용

    const [ingredientsData] = await mysqlDB2.query<Recommend[]>(
      `SELECT * FROM recommend WHERE page='home' AND type='ingredient';`
    );

    if (ingredientsData.length) {
      const ingredientValues = ingredientsData.map((type) => type.value);
      const ingredientPlaceholder = arrayToPlaceholders(ingredientValues);

      const [ingredientsRecipes] = await mysqlDB.query<RecommendRecipe[]>(
        `WITH LatestRecipes AS (
          SELECT 
            r.id recipe_id, 
            r.user_id, 
            r.name recipe_name, 
            i.ingredient_id,
            i.ingredient_name,
            ROW_NUMBER() OVER (PARTITION BY i.ingredient_id ORDER BY r.id DESC) AS row_num
          FROM recipes r
            JOIN 
              (SELECT recipe_id, ingredient_id, name ingredient_name
                FROM recipe_ingredients 
                WHERE ingredient_id IN (${ingredientPlaceholder})
              ) i
            ON r.id = i.recipe_id
        )
        SELECT 
          lr.recipe_id, 
          lr.recipe_name, 
          recipe_img, 
          u.username user_username, 
          u.img user_img, 
          lr.ingredient_name option_name
        FROM (
          SELECT *
          FROM LatestRecipes
          WHERE row_num <= 5
        ) AS lr
        JOIN recipe_img_view r_img
          ON lr.recipe_id = r_img.recipe_id
        JOIN users_simple_view u
          ON lr.user_id = u.id;
        `,
        [...ingredientValues]
      );

      const ingredientsResult =
        groupRecommendRecipesByOptionName(ingredientsRecipes);
      result.ingredient = ingredientsResult;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.use("/recipes", recipeRouter);

export default router;
