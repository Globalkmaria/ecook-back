import express from "express";
import { authGuard } from "../../../../middleware/auth.js";

const router = express.Router();

router.use(authGuard);

router.get("/:pantryBoxKey");

router.delete("/:pantryBoxKey");

export default router;
