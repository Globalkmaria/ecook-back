import mysqlDB from "../../db/mysql";
import { UserSimple } from "../recipes/recipe/type";
import { formatSearchResult } from "../recipes/recipesSearchService";
import { RecipesSimple } from "../recipes/type";

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

  return formatSearchResult(bookmarksData);
};
