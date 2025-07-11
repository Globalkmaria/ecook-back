import mysqlDB from "../../db/mysql";
import { getImgUrl } from "../../utils/img";
import { ServiceError } from "../helpers/ServiceError";
import { UserSimple } from "../recipes/recipe/type";
import { RecipesSimple } from "../recipes/type";

export const getUserDetail = async (username: string) => {
  const [userData] = await mysqlDB.execute<UserSimple[]>(
    `SELECT * FROM users WHERE username = ? AND deleted_at IS NULL`,
    [username]
  );

  if (!userData.length) throw new ServiceError(404, "User not found");

  const [recipesData] = await mysqlDB.execute<RecipesSimple[]>(
    `SELECT * FROM recipes_simple_view WHERE user_username = ? `,
    [username]
  );

  return {
    img: getImgUrl(userData[0].img),
    username: userData[0].username,
    totalPosts: recipesData.length,
  };
};
