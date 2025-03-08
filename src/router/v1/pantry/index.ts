import express from "express";

import pantryBoxesRouter from "./pantryBoxes/index";
import pantryItemsRouter from "./pantryItems/index";

const router = express.Router();

router.use("/boxes", pantryBoxesRouter);
router.use("/items", pantryItemsRouter);

export default router;
