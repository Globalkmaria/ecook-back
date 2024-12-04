import express from "express";

import { config } from "../../config/index.js";
import mysqlDB from "../../db/mysql.js";
import { ClientRecipeSimple, RecipesSimple } from "./recipes/index.js";
import { UserSimple } from "./recipe/index.js";
import { generateRecipeKey } from "./recipes/helper.js";
import { getImgUrl } from "../../utils/img.js";

const router = express.Router();

router.get("/:username", async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!username) return res.status(400).json({ error: "Invalid username" });

    const [userData] = await mysqlDB.execute<UserSimple[]>(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );

    if (!userData.length)
      return res.status(404).json({ error: "User not found" });

    const [recipesData] = await mysqlDB.execute<RecipesSimple[]>(
      `SELECT * FROM recipes_simple_view WHERE user_username = ? ORDER BY created_at DESC`,
      [username]
    );

    const recipes: ClientRecipeSimple[] = recipesData.map((recipe) => {
      const tagIds = recipe.tag_ids ? recipe.tag_ids.split(",") : [];
      const tagNames = recipe.tag_names ? recipe.tag_names.split(",") : [];
      const tags = tagIds.map((id, index) => ({
        id: parseInt(id, 10),
        name: tagNames[index],
      }));

      return {
        id: recipe.id,
        name: recipe.name,
        img: getImgUrl(recipe.img) ?? "",
        tags,
        hours: recipe.hours,
        minutes: recipe.minutes,
        key: generateRecipeKey(recipe.id, recipe.name),
      };
    });

    const user = {
      id: userData[0].id,
      img: getImgUrl(userData[0].img),
      username: userData[0].username,
    };

    res.status(200).json({ recipes, user });
  } catch (error) {
    next(error);
  }
});

export default router;
