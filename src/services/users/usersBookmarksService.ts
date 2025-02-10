import mysqlDB from "../../db/mysql.js";
import { UserSimple } from "../recipes/recipe/type.js";
import { RecipesSimple } from "../../router/v1/recipes/recipes.js";
import { formatClientRecipeSimple } from "./helper.js";

export const getUserByUsername = async (username: string) => {
  const [userData] = await mysqlDB.execute<UserSimple[]>(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );
  return userData;
};

export const getBookmarkedRecipesByUserId = async (userId: number) => {
  const [bookmarksData] = await mysqlDB.execute<RecipesSimple[]>(
    `SELECT * 
            FROM user_bookmarks u
            JOIN recipes_simple_view r ON r.id = u.recipe_id
            WHERE u.user_id = ?
            ORDER BY r.created_at DESC `,
    [userId]
  );

  return formatClientRecipeSimple(bookmarksData);
};
