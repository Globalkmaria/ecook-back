import express from "express";
import { authGuard } from "../../../../middleware/auth";

import { deletePantryItemController } from "../../../../controllers/pantry/pantryItems/deletePantryItemController";
import { updatePantryItemController } from "../../../../controllers/pantry/pantryItems/updatePantryItemController";

const router = express.Router();

router.use(authGuard);

router.patch("/:pantryItemKey", updatePantryItemController);

router.delete("/:pantryItemKey", deletePantryItemController);

export default router;
