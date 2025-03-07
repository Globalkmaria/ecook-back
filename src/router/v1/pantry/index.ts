import express from "express";

import pantryBoxesRouter from "./pantryBoxes/index.js";
import pantryItemsRouter from "./pantryItems/index.js";

const router = express.Router();

router.use("/boxes", pantryBoxesRouter);
router.use("/items", pantryItemsRouter);

export default router;
