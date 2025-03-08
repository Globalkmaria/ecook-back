import express from "express";

import { recommendHome } from "../../../controllers/recommends/recommendHomeController";
import { recommendPantryBoxController } from "../../../controllers/recommends/recommendPantryBoxController";

const router = express.Router();

router.get("/home", recommendHome);

router.get("/pantry/boxes/:pantryBoxKey", recommendPantryBoxController);

export default router;
