import express from "express";
import { authGuard } from "../../../../middleware/auth";
import { getPantryBoxesController } from "../../../../controllers/pantry/pantryBoxes/getPantryBoxesController";
import { createPantryBoxController } from "../../../../controllers/pantry/pantryBoxes/createPantryBoxController";

const router = express.Router();

router.use(authGuard);

router.get("/", getPantryBoxesController);

router.post("/", createPantryBoxController);

export default router;
