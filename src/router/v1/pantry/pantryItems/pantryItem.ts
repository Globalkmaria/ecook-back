import express from "express";


import { deletePantryItemController } from "../../../../controllers/pantry/pantryItems/deletePantryItemController";
import { updatePantryItemController } from "../../../../controllers/pantry/pantryItems/updatePantryItemController";
import { authGuard } from "../../../../middleware/auth";

const router = express.Router();

router.use(authGuard);

router.patch("/:pantryItemKey", updatePantryItemController);

router.delete("/:pantryItemKey", deletePantryItemController);

export default router;
