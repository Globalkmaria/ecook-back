import mysqlDB from "../../../db/mysql.js";
import { RecipeInfoWithUser } from "./type.js";
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
  RecipeIngredient,
  RecipeIngredientRequired,
  RecipeTag,
} from "./type.js";

export const getRecipeService = async (recipeId: string) => {
  const [info, ingredients, tags] = await Promise.all([
    getRecipeDetail(recipeId),
    getRecipeIngredientsWithProducts(recipeId),
    getRecipeTags(recipeId),
  ]);

  return generateRecipeInformation({ info, ingredients, tags });
};

const getRecipeDetail = async (recipeId: string) => {
  const [recipes] = await mysqlDB.query<RecipeInfoWithUser[]>(
    `SELECT * FROM recipe_with_user_info_view r where r.id = ?`,
    [recipeId]
  );

  if (!recipes) throw new ServiceError(404, "Recipe not found");

  return recipes[0];
};

const getRecipeTags = async (recipeId: string) => {
  const [tags] = await mysqlDB.query<RecipeTag[]>(
    `SELECT * FROM recipe_tags_view WHERE recipe_id = ?`,
    [recipeId]
  );
  return tags.map((tag) => ({
    id: tag.tag_id,
    name: tag.tag_name,
  }));
};

const getRecipeIngredients = async (recipeId: string) => {
  const [ingredients] = await mysqlDB.query<RecipeIngredient[]>(
    `SELECT * FROM recipe_ingredients_view WHERE recipe_id = ?`,
    [recipeId]
  );
  return ingredients;
};

const getRecipeIngredientsWithProducts = async (
  recipeId: string
): Promise<ClientRecipeDetail["ingredients"]> => {
  const ingredients = await getRecipeIngredients(recipeId);

  const ingredientAlternativeProductsMap = await getOtherProducts(ingredients);

  return ingredients.map((ingredient) =>
    generateClientRecipeIngredient(ingredient, ingredientAlternativeProductsMap)
  );
};

const getOtherProducts = async (ingredientsData: RecipeIngredient[]) => {
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

  const ingredientIds = getIngredientIds(ingredientsData);
  const productIds = getProductIds(ingredientsData);

  if (!ingredientIds.length || !productIds.length) return [];

  const ingredientIdsPlaceholder = arrayToPlaceholders(ingredientIds);
  const productIdsPlaceholder = arrayToPlaceholders(productIds);

  const [products] = await mysqlDB.query<RecipeIngredientRequired[]>(
    `WITH RankedProducts AS (
        SELECT 
            i.id as ingredient_id, 
            i.name as ingredient_name, 
            pdv.*, 
            ROW_NUMBER() OVER (PARTITION BY ip.ingredient_id ORDER BY ip.ingredient_id) AS row_num
        FROM ingredient_products ip
        JOIN ingredients i ON i.id = ip.ingredient_id
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
