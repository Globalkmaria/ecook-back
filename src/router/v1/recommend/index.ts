import express from "express";

import { recommendHome } from "../../../controllers/recommends/recommendHomeController.js";
import { recommendPantryBoxController } from "../../../controllers/recommends/recommendPantryBoxController.js";

const router = express.Router();

router.get("/home", recommendHome);

router.get("/pantry/boxes/:pantryBoxKey", recommendPantryBoxController);

export default router;
