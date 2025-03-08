import express from "express";
import { authGuard } from "../../../../middleware/auth";
import { getPantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/getPantryBoxController";
import { deletePantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/deletePantryBoxController";
import { createPantryItemController } from "../../../../controllers/pantry/pantryItems/createPantryItemController";

const router = express.Router();

router.use(authGuard);

router.get("/:pantryBoxKey", getPantryBoxController);

router.post("/:pantryBoxKey", createPantryItemController);

router.delete("/:pantryBoxKey", deletePantryBoxController);

export default router;
