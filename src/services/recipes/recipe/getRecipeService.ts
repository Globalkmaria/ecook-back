import { RowDataPacket } from "mysql2";

import mysqlDB from "../../../db/mysql.js";
import {
  RecipeInfo,
  UserSimple,
} from "../../../router/v1/recipes/recipe/recipe.js";
import { getImgUrl } from "../../../utils/img.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { ClientProduct } from "../../../controllers/products/type.js";
import { arrayToPlaceholders } from "../../../utils/query.js";
import {
  generateClientRecipeIngredient,
  generateClientRecipeProduct,
} from "./helper.js";

interface IngredientBase {
  id: number; // Primary key, auto_increment
  recipe_id: number; // Non-nullable, int
  ingredient_name: string; // Non-nullable, varchar(255)
  ingredient_quantity?: string; // Nullable, varchar(20)
  ingredient_id?: number; // Non-nullable, int
  product_id?: number; // Nullable, int
  product_name?: string; // Nullable, varchar(255)
  product_brand?: string; // Nullable, varchar(255)
  product_purchased_from?: string; // Nullable, varchar(255)
  product_link?: string; // Nullable, varchar(255)
  product_img?: string; // Nullable, varchar(255)
}

export interface RecipeIngredient extends RowDataPacket, IngredientBase {}

export type RecipeIngredientRequired = Omit<IngredientBase, "ingredient_id"> &
  RowDataPacket & {
    ingredient_id: number;
  };

interface RecipeTag extends RowDataPacket {
  recipe_id: number; // Non-nullable, int
  tag_id: number; // Non-nullable, int, with default 0
  tag_name: string; // Non-nullable, varchar(100)
}

interface RecipeImgs extends RowDataPacket {
  recipe_img: string; // Non-nullable, varchar(255)
}

interface RecipeProduct {
  id: number;
  name: string;
  brand: string | null;
  purchasedFrom: string | null;
  link: string | null;
  img: string | null;
}

interface Ingredient {
  id: number;
  name: string;
  quantity: string;
  ingredientId: number | null;
  userProduct: RecipeProduct | null;
  products: ClientRecipeProduct[] | null;
}

export interface ClientRecipeDetail {
  id: number;
  name: string;
  description: string;
  hours: number;
  minutes: number;
  steps: string[];
  img: string;
  ingredients: Ingredient[];
  tags: { id: number; name: string }[];
  user: { id: number; username: string; img: string | null };
}
export type ClientRecipeProduct = Omit<ClientProduct, "ingredient" | "key"> & {
  ingredientId: number;
};

export const getRecipeService = async (recipeId: string) => {
  const info = await getRecipeDetail(recipeId);

  const [imgs, ingredients, tags, user] = await Promise.all([
    getRecipeImgs(recipeId),
    getIngredients(recipeId),
    getRecipeTags(recipeId),
    getRecipeUser(info.user_id),
  ]);

  const result = generateRecipeInformation(info, imgs, ingredients, tags, user);
  return result;
};

const generateRecipeInformation = (
  info: RecipeInfo,
  img: ClientRecipeDetail["img"],
  ingredients: ClientRecipeDetail["ingredients"],
  tags: ClientRecipeDetail["tags"],
  user: ClientRecipeDetail["user"]
): ClientRecipeDetail => {
  return {
    id: info.id,
    name: info.name,
    description: info.description ?? "",
    hours: info.hours,
    minutes: info.minutes,
    steps: info.steps ? info.steps : [],
    img,
    ingredients,
    tags,
    user,
  };
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
  const [imgsData] = await mysqlDB.query<RecipeImgs[]>(
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

  const ingredients: Ingredient[] = ingredientsData.map((ingredient) =>
    generateClientRecipeIngredient(ingredient, ingredientIdWithProductsMap)
  );

  return ingredients;
};

const getIngredientIds = (ingredients: RecipeIngredient[]) =>
  ingredients
    .map((ingredient) => ingredient.ingredient_id)
    .filter((id): id is number => id !== undefined);

const getProductIds = (ingredients: RecipeIngredient[]) =>
  ingredients
    .map((ingredient) => ingredient.product_id)
    .filter((id): id is number => id !== undefined);

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
