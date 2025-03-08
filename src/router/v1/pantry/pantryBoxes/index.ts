import express from "express";

import pantryBoxesRouter from "./pantryBoxes.js";
import pantryBoxRouter from "./pantryBox.js";

const router = express.Router();

router.use("/", pantryBoxesRouter);
router.use("/", pantryBoxRouter);

export default router;
