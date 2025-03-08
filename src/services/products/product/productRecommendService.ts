import mysqlDB from "../../../db/mysql.js";
import {
  formatRecipeData,
  getUniqueRecipes,
} from "../../recipes/recipe/helper.js";
import { RecommendRecipe } from "../../recommends/type.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { Product } from "../type.js";

export const getProductRecommendService = async (productId: number) => {
  const productData = await getProductData(productId);

  if (!productData.length) throw new ServiceError(404, "Product not found");

  const productInfo = productData[0];

  if (!productInfo.ingredient_id)
    throw new ServiceError(400, "Product has no ingredient");

  const recipes = await getRecipes(productInfo);
  return recipes;
};

const getRecipes = async (product: Product) => {
  const result: RecommendRecipe[] = [];

  const productRecipes = await getProductRecipes(product.id);
  result.push(...productRecipes);

  const ingredientRecipes = await getIngredientRecipes(product.ingredient_id);
  result.push(...ingredientRecipes);

  const uniqueRecipes = getUniqueRecipes(result, 8);
  const formattedRecipes = formatRecipeData(uniqueRecipes);

  return formattedRecipes;
};

const getProductData = async (productId: number) => {
  const [productData] = await mysqlDB.query<Product[]>(
    `SELECT p.*, i.id ingredient_id, i.name ingredient_name
      FROM product_detail_view p
      JOIN ingredient_products ip ON p.id = ip.product_id
      JOIN ingredients i ON i.id = ip.ingredient_id
      WHERE p.id = ?;
    `,
    [productId]
  );
  return productData;
};

const getProductRecipes = async (productId: number) => {
  const [product_recipes] = await mysqlDB.query<RecommendRecipe[]>(
    `SELECT r.id recipe_id
            , r.name recipe_name
            , r.recipe_img
            , r.user_username
            , r.user_img
        FROM recipe_ingredients  ri
        JOIN recipe_with_user_info_view r 
        WHERE 
            ri.product_id = ?
        LIMIT 8
    ;
    `,
    [productId]
  );
  return product_recipes;
};

const getIngredientRecipes = async (ingredientId: number) => {
  const [ingredientRecipes] = await mysqlDB.query<RecommendRecipe[]>(
    `SELECT r.id recipe_id
            , r.name recipe_name
            , r.recipe_img
            , r.user_username
            , r.user_img
        FROM recipe_ingredients  ri
        JOIN recipe_with_user_info_view r 
        WHERE 
            ri.ingredient_id = ?
        LIMIT 8
    ;
    `,
    [ingredientId]
  );
  return ingredientRecipes;
};
