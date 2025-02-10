import express from "express";

import { upload } from "../../../db/aws.js";

import { login } from "../../../controllers/auth/authLoginController.js";
import { logout } from "../../../controllers/auth/authLogoutController.js";
import { signup } from "../../../controllers/auth/authSignupController.js";
import { checkUsernameAvailability } from "../../../controllers/auth/authUsernameController.js";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.post("/signup", upload.single("img"), signup);

router.get("/validate-username/:username", checkUsernameAvailability);

export default router;
