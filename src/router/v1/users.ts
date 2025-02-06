import express from "express";

import mysqlDB from "../../db/mysql.js";
import { getImgUrl } from "../../utils/img.js";
import { RecipesSimple } from "./recipes/recipes.js";
import { UserSimple } from "./recipes/recipe/recipe.js";
import { authGuard } from "../../middleware/auth.js";
import { getUserBookmarkedRecipes } from "../../controller/users/usersBookmarksController.js";

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

router.get("/:username/bookmarks", authGuard, getUserBookmarkedRecipes);

export default router;
