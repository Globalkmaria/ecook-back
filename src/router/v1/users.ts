import express from "express";

import { authGuard } from "../../middleware/auth.js";
import { getUserBookmarkedRecipes } from "../../controllers/users/usersBookmarksController.js";
import { getUser } from "../../controllers/users/userController.js";

const router = express.Router();

router.get("/:username", getUser);

router.get("/:username/bookmarks", authGuard, getUserBookmarkedRecipes);

export default router;
