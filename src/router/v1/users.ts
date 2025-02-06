import express from "express";

import mysqlDB from "../../db/mysql.js";
import { getImgUrl } from "../../utils/img.js";
import { ClientRecipeSimple, RecipesSimple } from "./recipes/recipes.js";
import { UserSimple } from "./recipes/recipe/recipe.js";
import { authGuard } from "../../middleware/auth.js";
import { SerializedUser } from "../../config/passport.js";
import { splitString } from "../../utils/normalize.js";
import { generateRecipeKey } from "./recipes/helper.js";

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
      `SELECT * FROM recipes_simple_view WHERE user_username = ? `,
      [username]
    );

    const user = {
      img: getImgUrl(userData[0].img),
      username: userData[0].username,
      totalPosts: recipesData.length,
    };

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/:username/bookmarks", authGuard, async (req, res, next) => {
  const user = req.user as SerializedUser;
  const userId = user.id;

  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Invalid username" });

    const [userData] = await mysqlDB.execute<UserSimple[]>(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );

    if (!userData.length)
      return res.status(404).json({ error: "User not found" });
    if (userData[0].id !== userId)
      return res.status(403).json({ error: "Forbidden" });

    const [bookmarksData] = await mysqlDB.execute<RecipesSimple[]>(
      `SELECT * 
          FROM user_bookmarks u
          JOIN recipes_simple_view r ON r.id = u.recipe_id
          WHERE u.user_id = ?
          ORDER BY r.created_at DESC `,
      [userId]
    );

    const formatSearchResult = (data: RecipesSimple[]): ClientRecipeSimple[] =>
      data.map((recipe) => {
        const tagIds = splitString(recipe.tag_ids);
        const tagNames = splitString(recipe.tag_names);
        const tags = tagIds.map((id, index) => ({
          id: parseInt(id, 10),
          name: tagNames[index],
        }));

        const key = generateRecipeKey(recipe.id, recipe.name);

        return {
          id: recipe.id,
          name: recipe.name,
          img: getImgUrl(recipe.img, true),
          tags,
          hours: recipe.hours,
          minutes: recipe.minutes,
          key,
          user: {
            username: recipe.user_username,
            img: getImgUrl(recipe.user_img),
          },
        };
      });

    const recipes = formatSearchResult(bookmarksData);

    res.status(200).json({
      search: recipes,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
