import express from "express";

import { deletePantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/deletePantryBoxController";
import { getPantryBoxController } from "../../../../controllers/pantry/pantryBoxes/pantryBox/getPantryBoxController";
import { createPantryItemController } from "../../../../controllers/pantry/pantryItems/createPantryItemController";
import { authGuard } from "../../../../middleware/auth";

const router = express.Router();

router.use(authGuard);

router.get("/:pantryBoxKey", getPantryBoxController);

router.post("/:pantryBoxKey", createPantryItemController);

router.delete("/:pantryBoxKey", deletePantryBoxController);

export default router;
