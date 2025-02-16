import express from "express";

import ingredientsRouter from "./ingredients.js";

const router = express.Router();

router.use("/", ingredientsRouter);

export default router;
