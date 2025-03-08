import {
  EditRecipe,
  RecipeInfo,
  RecipeInfoWithUser,
  RecipeRecommendationClientData,
} from "./type";
import { getImgUrl } from "../../../utils/img";
import {
  ClientRecipeDetail,
  ClientRecipeProduct,
  RecipeIngredient,
  RecipeIngredientRequired,
} from "./type";
import { sanitizeRecipeData } from "../helper";
import { generateRecipeKey } from "../utils";
import { RecommendRecipe } from "../../recommends/type";
import { shuffleArray } from "../../../utils/shuffle";
import { generateIngredientKey } from "../../ingredients/utils";
import { generateProductKey } from "../../products/utils";

export const generateClientRecipeIngredient = (
  ingredient: RecipeIngredient,
  map: Map<number, ClientRecipeProduct[]>
): ClientRecipeDetail["ingredients"][0] => ({
  id: ingredient.ingredient_id,
  key: generateIngredientKey(
    ingredient.ingredient_id,
    ingredient.ingredient_name
  ),
  name: ingredient.ingredient_name,
  quantity: ingredient.ingredient_quantity ?? "",
  ingredientId: ingredient.ingredient_id ?? null,
  userProduct: ingredient.product_id
    ? {
        id: ingredient.product_id,
        key: generateProductKey(
          ingredient.product_id,
          ingredient.product_name ?? ""
        ),
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
    .filter((id): id is number => !!id);

export const getProductIds = (ingredients: RecipeIngredient[]) =>
  ingredients
    .map((ingredient) => ingredient.product_id)
    .filter((id): id is number => !!id);

export const generateRecipeInformation = ({
  info,
  ingredients,
  tags,
}: {
  info: RecipeInfoWithUser;
  ingredients: ClientRecipeDetail["ingredients"];
  tags: ClientRecipeDetail["tags"];
}): ClientRecipeDetail => {
  const user = {
    id: info.user_id,
    username: info.user_username,
    img: getImgUrl(info.user_img, true),
  };

  const img = getImgUrl(info.recipe_img, true);
  const key = generateRecipeKey(info.id, info.name);
  return {
    name: info.name,
    description: info.description ?? "",
    hours: info.hours,
    minutes: info.minutes,
    steps: info.steps ?? [],
    img,
    ingredients,
    tags,
    user,
    key,
  };
};
export const getUpdatedRecipeData = ({
  newRecipe,
  oldRecipe,
}: {
  newRecipe: EditRecipe;
  oldRecipe: RecipeInfo;
}) => {
  const updates = new Map<string, string | number | string[]>();

  const { name, hours, minutes, description, steps } =
    sanitizeRecipeData(newRecipe);

  if (name !== oldRecipe.name) updates.set("name", name);
  if (hours !== oldRecipe.hours) updates.set("hours", hours);
  if (minutes !== oldRecipe.minutes) updates.set("minutes", minutes);
  if (description !== oldRecipe.description)
    updates.set("description", description);
  if (steps.join("") !== oldRecipe.steps.join(""))
    updates.set("steps", newRecipe.steps);

  return updates;
};

export const getRecipeName = (url: string): string =>
  url.split("-").slice(1).join("-");

export const getUniqueRecipes = (
  recipes: RecommendRecipe[],
  limit: number
): RecommendRecipe[] => {
  const recipeIdIndex = recipes.reduce<Record<number, number>>(
    (acc, recipe, index) => {
      acc[recipe.recipe_id] = index;
      return acc;
    },
    []
  );

  const uniqueIds = Array.from(
    new Set(recipes.map((recipe) => recipe.recipe_id))
  ).slice(0, limit);

  const uniqueRecipes = uniqueIds.map((id) => recipes[recipeIdIndex[id]]);
  shuffleArray(uniqueRecipes);

  return uniqueRecipes;
};

export const formatRecipeData = (
  recipes: RecommendRecipe[]
): RecipeRecommendationClientData[] =>
  recipes.map((recipe) => {
    const key = generateRecipeKey(recipe.recipe_id, recipe.recipe_name);
    return {
      key,
      name: recipe.recipe_name,
      img: getImgUrl(recipe.recipe_img),
      user: {
        username: recipe.user_username,
        img: getImgUrl(recipe.user_img),
      },
    };
  });

export const getTagsToInsertAndDelete = (
  oldTags: string[],
  newTags: string[]
) => {
  const oldTagsNames = new Set([...oldTags]);
  const tagsToInsert: string[] = [];

  newTags.forEach((tag) =>
    oldTagsNames.has(tag) ? oldTagsNames.delete(tag) : tagsToInsert.push(tag)
  );

  const tagsToDelete = [...oldTagsNames];

  return { tagsToInsert, tagsToDelete };
};
