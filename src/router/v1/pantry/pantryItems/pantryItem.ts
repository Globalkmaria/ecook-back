import express from "express";
import { authGuard } from "../../../../middleware/auth.js";
import { createPantryItemController } from "../../../../controllers/pantry/pantryItems/createPantryItemController.js";
import { deletePantryItemController } from "../../../../controllers/pantry/pantryItems/deletePantryItemController.js";
import { updatePantryItemController } from "../../../../controllers/pantry/pantryItems/updatePantryItemController.js";

const router = express.Router();

router.use(authGuard);

router.post("/:pantryItemKey", createPantryItemController);

router.patch("/:pantryItemKey", updatePantryItemController);

router.delete("/:pantryItemKey", deletePantryItemController);

export default router;
