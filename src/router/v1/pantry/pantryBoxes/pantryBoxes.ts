import express from "express";

import { createPantryBoxController } from "@/controllers/pantry/pantryBoxes/createPantryBoxController";
import { getPantryBoxesController } from "@/controllers/pantry/pantryBoxes/getPantryBoxesController";
import { authGuard } from "@/middleware/auth";

const router = express.Router();

router.use(authGuard);

router.get("/", getPantryBoxesController);

router.post("/", createPantryBoxController);

export default router;
