import express from "express";

import { validateId } from "../../../../utils/numbers";
import { decryptRecipeURLAndGetProductId } from "../helper";
import { RecommendRecipe } from "../../recommend/type";
import mysqlDB from "../../../../db/mysql";
import { Product } from "../products";
import {
  formatRecipeData,
  getUniqueRecipes,
} from "../../recipes/recipe/helper";

const router = express.Router();

router.get("/:key/recommend", async (req, res, next) => {
  const productId = decryptRecipeURLAndGetProductId(req.params.key);

  if (!productId || !validateId(productId)) {
    return res.status(400).json({ message: "Invalid key" });
  }

  try {
    const [productData] = await mysqlDB.query<Product[]>(
      `SELECT p.*, ri.ingredient_id, ri.name as ingredient_name
        FROM product_detail_view p
        JOIN recipe_ingredients ri ON p.id = ri.product_id
        WHERE p.id = ?;
      `,
      [productId]
    );

    const productInfo = productData[0];

    const result: RecommendRecipe[] = [];

    // product recipes
    const [product_recipes] = await mysqlDB.query<RecommendRecipe[]>(
      `SELECT r.id recipe_id, r.name recipe_name, recipe_img_view.recipe_img recipe_img, u.username user_username, u.img user_img
        FROM recipe_ingredients  ri
        JOIN recipes r 
            ON ri.recipe_id = r.id
        JOIN recipe_img_view
            ON r.id = recipe_img_view.recipe_id
        JOIN users_simple_view u
            ON u.id = r.user_id
        WHERE 
            ri.product_id = ?
        LIMIT 8
        ;
      `,
      [productId]
    );

    result.push(...product_recipes);

    // ingredient recipes
    const [ingredient_recipes] = await mysqlDB.query<RecommendRecipe[]>(
      `SELECT r.id recipe_id, r.name recipe_name, recipe_img_view.recipe_img recipe_img, u.username user_username, u.img user_img
          FROM recipe_ingredients  ri
          JOIN recipes r 
              ON ri.recipe_id = r.id
          JOIN recipe_img_view
              ON r.id = recipe_img_view.recipe_id
          JOIN users_simple_view u
              ON u.id = r.user_id
          WHERE 
            ri.ingredient_id = ?
          LIMIT 8
          ;
        `,
      [productInfo.ingredient_id]
    );
    result.push(...ingredient_recipes);

    const uniqueRecipes = getUniqueRecipes(result, 8);
    const formattedRecipes = formatRecipeData(uniqueRecipes);

    res.status(200).json(formattedRecipes);
  } catch (error) {
    next(error);
  }
});

export default router;
