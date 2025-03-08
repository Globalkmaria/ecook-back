import express from "express";
import { homeRecipes } from "../../../controllers/home/homeRecipesController";

const router = express.Router();

router.get("/", homeRecipes);

export default router;
