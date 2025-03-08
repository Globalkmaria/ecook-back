import express from "express";

import pantryItemRouter from "./pantryItem";

const router = express.Router();

router.use("/", pantryItemRouter);

export default router;
