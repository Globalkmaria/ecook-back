import express from "express";
import { RowDataPacket } from "mysql2";

import { authGuard } from "../../../middleware/auth.js";

import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../../../controllers/bookmarks/bookmarksController.js";

const router = express.Router();

export interface Bookmark {
  recipe_id: number;
  user_id: number;
}

export interface BookmarkRecipe extends RowDataPacket, Bookmark {
  recipe_name: string;
}

router.get("/", authGuard, getBookmarks);

router.post("/:recipeKey", authGuard, addBookmark);

router.delete("/:recipeKey", authGuard, removeBookmark);

export default router;
