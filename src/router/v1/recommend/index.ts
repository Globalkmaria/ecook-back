import express from "express";

import { recommendHome } from "../../../controllers/recommends/recommendHomeController.js";

const router = express.Router();

router.get("/home", recommendHome);

export default router;
