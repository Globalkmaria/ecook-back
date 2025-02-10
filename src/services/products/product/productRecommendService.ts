import mysqlDB from "../../../db/mysql.js";
import {
  formatRecipeData,
  getUniqueRecipes,
} from "../../../router/v1/recipes/recipe/helper.js";
import { RecommendRecipe } from "../../../router/v1/recommend/type.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { Product } from "../type.js";

export const getProductRecommendService = async (productId: string) => {
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

const getProductData = async (productId: string) => {
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
            , recipe_img_view.recipe_img recipe_img
            , u.username user_username
            , u.img user_img
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
  return product_recipes;
};

const getIngredientRecipes = async (ingredientId: number) => {
  const [ingredientRecipes] = await mysqlDB.query<RecommendRecipe[]>(
    `SELECT r.id recipe_id
            , r.name recipe_name
            , recipe_img_view.recipe_img recipe_img
            , u.username user_username
            , u.img user_img
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
    [ingredientId]
  );
  return ingredientRecipes;
};
