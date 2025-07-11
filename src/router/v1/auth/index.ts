import express from "express";

import { deleteAccount } from "../../../controllers/auth/authDeleteController";
import { login } from "../../../controllers/auth/authLoginController";
import { logout } from "../../../controllers/auth/authLogoutController";
import { signup } from "../../../controllers/auth/authSignupController";
import { checkUsernameAvailability } from "../../../controllers/auth/authUsernameController";
import { upload } from "../../../db/aws";
import { authGuard } from "../../../middleware/auth";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.post("/signup", upload.single("img"), signup);

router.get("/validate-username/:username", checkUsernameAvailability);

router.delete("/delete-account", authGuard, deleteAccount);

export default router;
