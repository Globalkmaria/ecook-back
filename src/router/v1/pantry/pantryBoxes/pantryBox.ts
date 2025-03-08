import express from "express";
import { authGuard } from "../../../../middleware/auth.js";
import { getPantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/getPantryBoxController.js";
import { deletePantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/deletePantryBoxController.js";
import { createPantryItemController } from "../../../../controllers/pantry/pantryItems/createPantryItemController.js";

const router = express.Router();

router.use(authGuard);

router.get("/:pantryBoxKey", getPantryBoxController);

router.post("/:pantryBoxKey", createPantryItemController);

router.delete("/:pantryBoxKey", deletePantryBoxController);

export default router;
