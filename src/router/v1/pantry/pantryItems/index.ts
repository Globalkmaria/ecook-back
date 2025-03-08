import express from "express";

import pantryItemRouter from "./pantryItem.js";

const router = express.Router();

router.use("/", pantryItemRouter);

export default router;
