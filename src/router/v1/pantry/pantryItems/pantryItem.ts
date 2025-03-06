import express from "express";
import { authGuard } from "../../../../middleware/auth.js";

const router = express.Router();

router.use(authGuard);

router.post("/:pantryItemKey");

router.patch("/:pantryItemKey");

router.delete("/:pantryItemKey");

export default router;
