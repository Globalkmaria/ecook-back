import express from "express";
import { RowDataPacket } from "mysql2";

import mysqlDB from "../../../db/mysql.js";

import { authGuard } from "../../../middleware/auth.js";

import { SerializedUser } from "../../../config/passport.js";

import { generateRecipeKey } from "../recipes/helper.js";
import { decryptRecipeURLAndGetRecipeId } from "../recipes/recipe/helper.js";

const router = express.Router();

export interface Bookmark {
  recipe_id: number;
  user_id: number;
}

export interface BookmarkRecipe extends RowDataPacket, Bookmark {
  recipe_name: string;
}

router.get("/", authGuard, async (req, res, next) => {
  const user = req.user as SerializedUser;
  const userId = user.id;

  try {
    const [bookmarks] = await mysqlDB.query<BookmarkRecipe[]>(
      `SELECT r.id as recipe_id, r.name as recipe_name 
          FROM user_bookmarks u
          JOIN recipes r ON r.id = u.recipe_id
          WHERE u.user_id = ? 
          `,
      [userId]
    );

    const recipeKeys = bookmarks.map((bookmark) =>
      generateRecipeKey(bookmark.recipe_id, bookmark.recipe_name)
    );

    res.json(recipeKeys);
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the bookmarked recipes.",
      error,
    });
  }
});

router.post("/:recipeKey", authGuard, async (req, res, next) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;
    const recipeKey = req.params.recipeKey;

    const recipeId = decryptRecipeURLAndGetRecipeId(recipeKey);

    if (!recipeId) throw new Error("Invalid recipe key");

    await mysqlDB.query(
      `INSERT IGNORE INTO user_bookmarks (user_id, recipe_id) VALUES (?, ?)`,
      [userId, recipeId]
    );

    res.status(201).send();
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while bookmarking the recipe.",
      error,
    });
  }
});

router.delete("/:recipeKey", authGuard, async (req, res, next) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;
    const recipeKey = req.params.recipeKey;

    const recipeId = decryptRecipeURLAndGetRecipeId(recipeKey);

    if (!recipeId) throw new Error("Invalid recipe key");

    await mysqlDB.query(
      `DELETE FROM user_bookmarks WHERE user_id =? AND recipe_id =?`,
      [userId, recipeId]
    );

    res.status(204).send();
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while unbookmarking the recipe.",
      error,
    });
  }
});

export default router;
