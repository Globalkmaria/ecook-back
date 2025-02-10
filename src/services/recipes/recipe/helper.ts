import { RecipeInfo } from "../../../router/v1/recipes/recipe/recipe.js";
import { getImgUrl } from "../../../utils/img.js";
import {
  ClientRecipeDetail,
  ClientRecipeProduct,
  RecipeIngredient,
  RecipeIngredientRequired,
} from "./type.js";

export const generateClientRecipeIngredient = (
  ingredient: RecipeIngredient,
  map: Map<number, ClientRecipeProduct[]>
): ClientRecipeDetail["ingredients"][0] => ({
  id: ingredient.id,
  name: ingredient.ingredient_name,
  quantity: ingredient.ingredient_quantity ?? "",
  ingredientId: ingredient.ingredient_id ?? null,
  userProduct: ingredient.product_id
    ? {
        id: ingredient.product_id,
        name: ingredient.product_name ?? "",
        brand: ingredient.product_brand ?? null,
        purchasedFrom: ingredient.product_purchased_from ?? null,
        link: ingredient.product_link ?? null,
        img: getImgUrl(ingredient.product_img),
      }
    : null,
  products: ingredient.ingredient_id
    ? map.get(ingredient.ingredient_id) ?? null
    : null,
});

export const generateClientRecipeProduct = (
  product: RecipeIngredientRequired
): ClientRecipeProduct => {
  return {
    id: product.id,
    ingredientId: product.ingredient_id,
    userId: product.user_id,
    name: product.name,
    brand: product.brand,
    purchasedFrom: product.purchased_from,
    link: product.link,
    img: getImgUrl(product.img, true),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
};

export const getIngredientIds = (ingredients: RecipeIngredient[]) =>
  ingredients
    .map((ingredient) => ingredient.ingredient_id)
    .filter((id): id is number => id !== undefined);

export const getProductIds = (ingredients: RecipeIngredient[]) =>
  ingredients
    .map((ingredient) => ingredient.product_id)
    .filter((id): id is number => id !== undefined);

export const generateRecipeInformation = (
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
