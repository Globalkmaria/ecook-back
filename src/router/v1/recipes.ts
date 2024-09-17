import mysqlDB from "../../db/mysql";
import express from "express";
import { RowDataPacket } from "mysql2";

const router = express.Router();

interface RecipesSimple extends RowDataPacket {
  id: number;
  name: string;
  simple_description: string;
  recipe_img: string;
  tag_id: number;
  tag_name: string;
}

interface ClientRecipeSimple {
  id: number;
  name: string;
  simpleDescription: string;
  img: string;
  tags: { id: number; name: string }[];
}

router.get("/", async (req, res, next) => {
  try {
    const [result] = await mysqlDB.query<RecipesSimple[]>(
      `SELECT * FROM recipes_simple_view`
    );

    const recipeMap = new Map<number, ClientRecipeSimple>();
    const tagsMap = new Map<number, ClientRecipeSimple["tags"]>();

    result.forEach((recipe) => {
      if (recipe.tag_id) {
        const recipeTags = tagsMap.get(recipe.id) || [];
        recipeTags.push({ id: recipe.tag_id, name: recipe.tag_name });
        tagsMap.set(recipe.id, recipeTags);
      }

      if (!recipeMap.has(recipe.id)) {
        recipeMap.set(recipe.id, {
          id: recipe.id,
          name: recipe.name,
          simpleDescription: recipe.simple_description,
          img: recipe.recipe_img,
          tags: [],
        });
      }
    });

    tagsMap.forEach((tagList, id) => {
      const recipe = recipeMap.get(id);
      if (recipe) recipe.tags = tagList;
    });

    const data = [...recipeMap.values()];
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
