import express from "express";

import pantryBoxRouter from "./pantryBox";
import pantryBoxesRouter from "./pantryBoxes";

const router = express.Router();

router.use("/", pantryBoxesRouter);
router.use("/", pantryBoxRouter);

export default router;
