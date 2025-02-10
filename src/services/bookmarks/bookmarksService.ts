import mysqlDB from "../../db/mysql.js";
import { BookmarkRecipe } from "../../router/v1/bookmarks/index.js";

export const getBookmarksByUserId = async (userId: number) => {
  const [bookmarks] = await mysqlDB.query<BookmarkRecipe[]>(
    `SELECT r.id as recipe_id, r.name as recipe_name 
      FROM user_bookmarks u
      JOIN recipes r ON r.id = u.recipe_id
      WHERE u.user_id = ? 
      `,
    [userId]
  );

  return bookmarks;
};

export const addUserBookmark = async (userId: number, recipeId: string) =>
  await mysqlDB.query(
    `INSERT IGNORE INTO user_bookmarks (user_id, recipe_id) VALUES (?, ?)`,
    [userId, recipeId]
  );

export const removeUserBookmark = async (userId: number, recipeId: string) =>
  await mysqlDB.query(
    `DELETE FROM user_bookmarks WHERE user_id =? AND recipe_id =?`,
    [userId, recipeId]
  );
