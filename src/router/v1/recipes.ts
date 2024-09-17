import express from "express";
import mysqlDB from "../../db/mysql.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [result] = await mysqlDB.query(`SELECT * FROM recipes_simple_view`);
    // const recipes = new Map<
    //   String,
    //   {
    //     name: string;
    //     simple_description: string;
    //     recipe_img: string;
    //   }
    // >();

    // const recipes = result.map((recipe) => ({
    //   id: recipe.id,
    //   name: recipe.name,

    //   difficulty: recipe.recipe_difficulty,
    //   ingredients: recipe.ingredients.split(","),
    // }));
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

export default router;
