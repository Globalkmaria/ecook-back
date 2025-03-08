import express from "express";

import { authGuard } from "../../middleware/auth";
import { getUserBookmarkedRecipes } from "../../controllers/users/usersBookmarksController";
import { getUser } from "../../controllers/users/userController";

const router = express.Router();

router.get("/:username", getUser);

router.get("/:username/bookmarks", authGuard, getUserBookmarkedRecipes);

export default router;
