import express from "express";

import { ingredientsBatch } from "../../../controllers/ingredients/ingredientsBatchController";

const router = express.Router();

/**
 * @route POST /api/ingredients/batch
 * @desc  Search ingredients by keys
 */

router.post("/batch", ingredientsBatch);

export default router;
