import { NextFunction, Request, Response } from "express";
import { SerializedUser } from "../../config/passport.js";
import {
  addUserBookmark,
  getBookmarksByUserId,
  removeUserBookmark,
} from "../../services/bookmarks/bookmarksService.js";
import { generateRecipeKey } from "../../router/v1/recipes/helper.js";
import { decryptRecipeURLAndGetRecipeId } from "../../router/v1/recipes/recipe/helper.js";

export const getBookmarks = async (
  req: Request<{}, {}, {}, {}>,
  res: Response<string[] | { error: string }>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;

    const bookmarks = await getBookmarksByUserId(userId);

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
};

interface AddBookmarkParams {
  recipeKey?: string;
}

export const addBookmark = async (
  req: Request<{}, {}, {}, AddBookmarkParams>,
  res: Response<void | { error: string }>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;
    const { recipeKey } = req.params as AddBookmarkParams;

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

export const removeBookmark = async (
  req: Request<{}, {}, {}, RemoveBookmarkParams>,
  res: Response<void | { error: string }>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const userId = user.id;
    const { recipeKey } = req.params as RemoveBookmarkParams;

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
