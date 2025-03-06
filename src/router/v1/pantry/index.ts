import express from "express";

import pantryBoxesRouter from "./pantryBoxes/index.js";
import pantryItemsRouter from "./pantryItems/index.js";

const router = express.Router();

router.use("/pantry-boxes", pantryBoxesRouter);
router.use("/pantry-items", pantryItemsRouter);

export default router;
