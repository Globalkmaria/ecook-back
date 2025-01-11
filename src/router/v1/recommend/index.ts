import express from "express";
import { RowDataPacket } from "mysql2";

import mysqlDB2 from "../../../db/mysql2.js";
import mysqlDB from "../../../db/mysql.js";

import { getImgUrl } from "../../../utils/img.js";
import { generateRecipeKey } from "../recipes/helper.js";

interface Recommend extends RowDataPacket {
  id: number;
  page: string;
  type: string;
  value: string;
  label: string;
}

interface RecommendRecipe extends RowDataPacket {
  id: number;
  name: string;
  img: string;
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
        `SELECT recipes.id , recipes.name, img.recipe_img as img
        FROM (SELECT * FROM recipe_tags WHERE tag_id = ?) AS filtered_tags
        JOIN recipes ON recipes.id = filtered_tags.recipe_id
        JOIN recipe_img_view img ON recipes.id = img.recipe_id
        LIMIT 5;
        `,
        [Number(type.value)]
      )
    );

    const recipes = await Promise.all(recipesPromises);

    const result = types.map((type, i) => {
      const typeRecipes = recipes[i][0].map((recipe) => {
        const key = generateRecipeKey(recipe.id, recipe.name);
        return {
          name: recipe.name,
          img: getImgUrl(recipe.img, true),
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

export default router;
