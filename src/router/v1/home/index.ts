import express from "express";
import { homeRecipes } from "../../../controllers/home/homeRecipesController.js";

const router = express.Router();

router.get("/", homeRecipes);

export default router;
