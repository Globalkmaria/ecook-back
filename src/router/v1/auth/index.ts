import express from "express";

import { upload } from "../../../db/aws";

import { login } from "../../../controllers/auth/authLoginController";
import { logout } from "../../../controllers/auth/authLogoutController";
import { signup } from "../../../controllers/auth/authSignupController";
import { checkUsernameAvailability } from "../../../controllers/auth/authUsernameController";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.post("/signup", upload.single("img"), signup);

router.get("/validate-username/:username", checkUsernameAvailability);

export default router;
