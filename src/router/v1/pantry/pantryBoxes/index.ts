import express from "express";

import pantryBoxesRouter from "./pantryBoxes";
import pantryBoxRouter from "./pantryBox";

const router = express.Router();

router.use("/", pantryBoxesRouter);
router.use("/", pantryBoxRouter);

export default router;
