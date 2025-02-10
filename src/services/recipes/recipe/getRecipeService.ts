import mysqlDB from "../../../db/mysql.js";
import {
  RecipeInfo,
  UserSimple,
} from "../../../router/v1/recipes/recipe/recipe.js";
import { getImgUrl } from "../../../utils/img.js";
import { ServiceError } from "../../helpers/ServiceError.js";

import { arrayToPlaceholders } from "../../../utils/query.js";

import {
  generateClientRecipeIngredient,
  generateClientRecipeProduct,
  generateRecipeInformation,
  getIngredientIds,
  getProductIds,
} from "./helper.js";
import {
  ClientRecipeDetail,
  ClientRecipeProduct,
  RecipeImg,
  RecipeIngredient,
  RecipeIngredientRequired,
  RecipeTag,
} from "./type.js";

export const getRecipeService = async (recipeId: string) => {
  const info = await getRecipeDetail(recipeId);

  const [imgs, ingredients, tags, user] = await Promise.all([
    getRecipeImgs(recipeId),
    getIngredients(recipeId),
    getRecipeTags(recipeId),
    getRecipeUser(info.user_id),
  ]);

  return generateRecipeInformation(info, imgs, ingredients, tags, user);
};

const getRecipeDetail = async (recipeId: string) => {
  const [recipe_info] = await mysqlDB.query<RecipeInfo[]>(
    `SELECT * FROM recipes where recipes.id = ?`,
    [recipeId]
  );

  if (!recipe_info) throw new ServiceError(404, "Recipe not found");

  return recipe_info[0];
};

const getRecipeImgs = async (recipeId: string) => {
  const [imgsData] = await mysqlDB.query<RecipeImg[]>(
    `SELECT recipe_img FROM recipe_img_view WHERE recipe_id = ?`,
    [recipeId]
  );

  return getImgUrl(imgsData[0].recipe_img, true);
};

const getRecipeTags = async (recipeId: string) => {
  const [tagsData] = await mysqlDB.query<RecipeTag[]>(
    `SELECT * FROM recipe_tags_view WHERE recipe_id = ?`,
    [recipeId]
  );
  return tagsData.map((tag) => ({
    id: tag.tag_id,
    name: tag.tag_name,
  }));
};

const getRecipeUser = async (
  userId: number
): Promise<ClientRecipeDetail["user"]> => {
  const [userData] = await mysqlDB.query<UserSimple[]>(
    `SELECT * FROM users_simple_view WHERE id = ?`,
    [userId]
  );

  const user = userData[0];
  return {
    id: user.id,
    username: user.username,
    img: getImgUrl(user.img, true),
  };
};

const getRecipeIngredients = async (recipeId: string) => {
  const [ingredients] = await mysqlDB.query<RecipeIngredient[]>(
    `SELECT * FROM recipe_ingredients_view WHERE recipe_id = ?`,
    [recipeId]
  );
  return ingredients;
};

const getIngredients = async (recipeId: string) => {
  const ingredientsData = await getRecipeIngredients(recipeId);

  const ingredientIdWithProductsMap = await getIngredientProductsMap(
    ingredientsData
  );

  const ingredients: ClientRecipeDetail["ingredients"] = ingredientsData.map(
    (ingredient) =>
      generateClientRecipeIngredient(ingredient, ingredientIdWithProductsMap)
  );

  return ingredients;
};

const getIngredientProductsMap = async (
  ingredientsData: RecipeIngredient[]
) => {
  const products = await getProducts(ingredientsData);
  const map: Map<number, ClientRecipeProduct[]> = new Map();

  products.forEach((product) => {
    const ingredientId = product.ingredient_id;

    const currentProducts = map.get(ingredientId) || [];
    currentProducts.push(generateClientRecipeProduct(product));

    map.set(ingredientId, currentProducts);
  });

  return map;
};

const getProducts = async (ingredientsData: RecipeIngredient[]) => {
  const limit = 5;

  const ingredientIdsPlaceholder = arrayToPlaceholders(
    getIngredientIds(ingredientsData)
  );
  const productIdsPlaceholder = arrayToPlaceholders(
    getProductIds(ingredientsData)
  );

  const [products] = await mysqlDB.query<RecipeIngredientRequired[]>(
    `WITH RankedProducts AS (
        SELECT 
            ip.ingredient_id, 
            ip.ingredient_name, 
            pdv.*, 
            ROW_NUMBER() OVER (PARTITION BY ip.ingredient_id ORDER BY ip.ingredient_id) AS row_num
        FROM ingredient_products ip
        JOIN product_detail_view pdv ON pdv.id = ip.product_id
        WHERE ip.ingredient_id IN (?) 
            AND pdv.id NOT IN (?)
    )
    SELECT * 
    FROM RankedProducts
    WHERE row_num <= ${limit}
    ORDER BY ingredient_id, row_num;
    `,
    [ingredientIdsPlaceholder, productIdsPlaceholder]
  );

  return products;
};
