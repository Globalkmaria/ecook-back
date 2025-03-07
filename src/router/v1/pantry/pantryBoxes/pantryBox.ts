import express from "express";
import { authGuard } from "../../../../middleware/auth.js";
import { getPantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/getPantryBoxController.js";
import { deletePantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/deletePantryBoxController.js";

const router = express.Router();

router.use(authGuard);

router.get("/:pantryBoxKey", getPantryBoxController);

router.delete("/:pantryBoxKey", deletePantryBoxController);

export default router;
