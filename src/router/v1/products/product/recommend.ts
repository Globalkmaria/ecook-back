import express from "express";

import { validateId } from "../../../../utils/numbers.js";
import { decryptRecipeURLAndGetProductId } from "../helper.js";
import { RecommendRecipe } from "../../recommend/type.js";
import mysqlDB from "../../../../db/mysql.js";
import { Product } from "../products.js";
import {
  formatRecipeData,
  getUniqueRecipes,
} from "../../recipes/recipe/helper.js";

const router = express.Router();

router.get("/:key/recommend", async (req, res, next) => {
  const productId = decryptRecipeURLAndGetProductId(req.params.key);

  if (!productId || !validateId(productId)) {
    return res.status(400).json({ message: "Invalid key" });
  }

  try {
    const [productData] = await mysqlDB.query<Product[]>(
      `SELECT p.*, i.id ingredient_id, i.name ingredient_name
    FROM product_detail_view p
    JOIN ingredient_products ip ON p.id = ip.product_id
    JOIN ingredients i ON i.id = ip.ingredient_id
    WHERE p.id = ?;
      `,
      [productId]
    );

    if (!productData.length) {
      return res.status(400).json({ message: "Product not found" });
    }

    const productInfo = productData[0];

    if (!productInfo.ingredient_id) {
      return res.status(400).json({ message: "Product has no ingredient" });
    }

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
