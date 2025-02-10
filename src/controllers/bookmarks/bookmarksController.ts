import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport.js";
import {
  addUserBookmark,
  getBookmarksByUserId,
  removeUserBookmark,
} from "../../services/bookmarks/bookmarksService.js";
import { decryptRecipeURLAndGetRecipeId } from "../../services/recipes/recipe/helper.js";
import { generateRecipeKeysForBookmarks } from "./helper.js";

type GetBookmarksResponse = string[] | { error: string };

export const getBookmarks = async (
  req: Request,
  res: Response<GetBookmarksResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;

    const bookmarks = await getBookmarksByUserId(userId);

    const recipeKeys = generateRecipeKeysForBookmarks(bookmarks);

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
};

interface AddBookmarkParams {
  recipeKey?: string;
}

type AddBookmarkResponse = void | { error: string };

export const addBookmark = async (
  req: Request<AddBookmarkParams, {}, {}>,
  res: Response<AddBookmarkResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;
    const { recipeKey } = req.params;

    if (!recipeKey) {
      next({
        status: 400,
        message: "Invalid request",
      });
      return;
    }

    const recipeId = decryptRecipeURLAndGetRecipeId(recipeKey);

    if (!recipeId) {
      next({
        status: 400,
        message: "Invalid recipe key",
      });
      return;
    }

    await addUserBookmark(userId, recipeId);
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
};

interface RemoveBookmarkParams {
  recipeKey?: string;
}

type RemoveBookmarkResponse = void | { error: string };

export const removeBookmark = async (
  req: Request<RemoveBookmarkParams>,
  res: Response<RemoveBookmarkResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;
    const { recipeKey } = req.params;

    if (!recipeKey) {
      next({
        status: 400,
        message: "Invalid request",
      });
      return;
    }

    const recipeId = decryptRecipeURLAndGetRecipeId(recipeKey);

    if (!recipeId) throw new Error("Invalid recipe key");

    await removeUserBookmark(userId, recipeId);

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
};
