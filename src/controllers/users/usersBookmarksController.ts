import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport";
import {
  getBookmarkedRecipesByUserId,
  getUserByUsername,
} from "../../services/users/usersBookmarksService";
import { ClientRecipeSimple } from "../../services/recipes/type";

interface UserBookmarksQueryParams {
  username?: string;
}

interface UserBookmarksResponse {
  search: ClientRecipeSimple[];
  recommend: ClientRecipeSimple[];
}

export const getUserBookmarkedRecipes = async (
  req: Request<{}, {}, {}, UserBookmarksQueryParams>,
  res: Response<UserBookmarksResponse | { error: string }>,
  next: NextFunction
) => {
  const user = req.user as SerializedUser;
  const userId = user.id;
  const { username } = req.params as UserBookmarksQueryParams;

  if (!username || !userId) {
    next({
      status: 401,
      message: "Unauthorized",
    });
    return;
  }

  try {
    const userData = await getUserByUsername(username);
    if (!userData.length) {
      next({
        status: 404,
        message: "User not found",
      });
    }
    if (userData[0].id !== userId) {
      next({
        status: 403,
        message: "Forbidden",
      });
    }
    const search = await getBookmarkedRecipesByUserId(userId);

    res.status(200).json({
      search,
      recommend: [],
    });
  } catch (error) {
    next(error);
  }
};
