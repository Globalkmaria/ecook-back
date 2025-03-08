import express from "express";

import { getUser } from "../../controllers/users/userController";
import { getUserBookmarkedRecipes } from "../../controllers/users/usersBookmarksController";
import { authGuard } from "../../middleware/auth";

const router = express.Router();

router.get("/:username", getUser);

router.get("/:username/bookmarks", authGuard, getUserBookmarkedRecipes);

export default router;
