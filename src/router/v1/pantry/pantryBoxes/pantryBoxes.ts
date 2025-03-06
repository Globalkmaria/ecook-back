import express from "express";
import { authGuard } from "../../../../middleware/auth.js";

const router = express.Router();

router.use(authGuard);

router.get("/");

router.post("/");

export default router;
