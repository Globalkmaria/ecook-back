import { HomeRecommendationSection } from "../../controllers/recommends/recommendHomeController";
import mysqlDB from "../../db/mysql";
import mysqlDB2 from "../../db/mysql2";
import { arrayToPlaceholders } from "../../utils/query";

import { groupRecommendRecipesByOptionName } from "./helper";
import { RecommendRecipeWithOption, Recommend } from "./type";

export const getTagRecommend = async (): Promise<HomeRecommendationSection> => {
  const [tagsData] = await mysqlDB2.query<Recommend[]>(
    `SELECT * FROM recommend WHERE page='home' AND type='tag';`
  );

  if (!tagsData.length)
    return {
      recipes: {},
      order: [],
    };

  const tagValues = tagsData.map((type) => type.value);
  const tagPlaceholder = arrayToPlaceholders(tagValues);

  const [tagRecipes] = await mysqlDB.query<RecommendRecipeWithOption[]>(
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

  const recipes = groupRecommendRecipesByOptionName(tagRecipes);
  const order = tagsData
    .sort((a, b) => a.order - b.order)
    .map((type) => type.label)
    .filter((label) => recipes[label]);
  return {
    recipes,
    order,
  };
};

export const getIngredientRecommend =
  async (): Promise<HomeRecommendationSection> => {
    const [ingredientsData] = await mysqlDB2.query<Recommend[]>(
      `SELECT * FROM recommend r
      WHERE page='home' AND type='ingredient' 
      ORDER BY r.id;`
    );

    if (!ingredientsData.length)
      return {
        recipes: {},
        order: [],
      };

    const ingredientValues = ingredientsData.map((type) => type.value);
    const ingredientPlaceholder = arrayToPlaceholders(ingredientValues);

    const [ingredientsRecipes] = await mysqlDB.query<
      RecommendRecipeWithOption[]
    >(
      `SELECT 
        ingredient_name AS option_name,
        ranked.recipe_id AS recipe_id,
        recipe_name,
        r_img.recipe_img,
        u.username AS user_username,
        u.img AS user_img
      FROM (
        SELECT 
          ingredient_name,
          recipe_id,
          recipe_name,
          user_id
        FROM (
          SELECT 
            ri.name AS ingredient_name,
            r.id AS recipe_id,
            r.name AS recipe_name,
            r.user_id,
            ROW_NUMBER() OVER (PARTITION BY ri.ingredient_id ORDER BY r.id DESC) AS rn
          FROM recipe_ingredients ri
          JOIN recipes r ON r.id = ri.recipe_id
          WHERE ri.ingredient_id IN (${ingredientPlaceholder})
        ) ranked_all
        WHERE rn <= 5
      ) ranked
      JOIN recipe_img_view r_img ON ranked.recipe_id = r_img.recipe_id
      JOIN users_simple_view u ON ranked.user_id = u.id
      ORDER BY ingredient_name, recipe_id DESC;
    `,
      [...ingredientValues]
    );

    const recipes = groupRecommendRecipesByOptionName(ingredientsRecipes);
    const order = ingredientsData
      .sort((a, b) => a.order - b.order)
      .map((type) => type.label)
      .filter((label) => recipes[label]);

    return {
      recipes,
      order,
    };
  };
