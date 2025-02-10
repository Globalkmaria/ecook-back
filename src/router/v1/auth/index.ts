import express from "express";

import { upload } from "../../../db/aws.js";

import { login } from "../../../controller/auth/authLoginController.js";
import { logout } from "../../../controller/auth/authLogoutController.js";
import { signup } from "../../../controller/auth/authSignupController.js";
import { checkUsernameAvailability } from "../../../controller/auth/authUsernameController.js";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.post("/signup", upload.single("img"), signup);

router.get("/validate-username/:username", checkUsernameAvailability);

export default router;
