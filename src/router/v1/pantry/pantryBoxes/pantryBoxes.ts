import express from "express";
import { authGuard } from "../../../../middleware/auth.js";
import { getPantryBoxesController } from "../../../../controllers/pantry/pantryBoxes/getPantryBoxesController.js";
import { createPantryBoxController } from "../../../../controllers/pantry/pantryBoxes/createPantryBoxController.js";

const router = express.Router();

router.use(authGuard);

router.get("/", getPantryBoxesController);

router.post("/", createPantryBoxController);

export default router;
