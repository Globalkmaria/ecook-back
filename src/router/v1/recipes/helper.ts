import { config } from "../../../config/index.js";
import { encrypt } from "../../../utils/encrypt.js";
import { lightSlugify } from "../../../utils/normalize.js";
import { INewRecipe, IngredientNewProduct, RecipesSimple } from "./index.js";

export const generateRecipeKey = (id: RecipesSimple["id"], name: string) =>
  `${encrypt(
    id.toString(),
    config.key.recipe.key,
    config.key.recipe.iv
  )}-${lightSlugify(name)}`;

export const getNewRecipeData = (recipe: INewRecipe, userId: number) => {
  const { name, hours, minutes, description, steps } =
    sanitizeRecipeData(recipe);
  return [name, userId, hours, minutes, description, steps];
};

export const sanitizeRecipeData = (recipe: INewRecipe) => {
  const name = recipe.name.trim().replace(/\s+/g, " ");
  const hours = parseInt((recipe.hours ?? 0).toString(), 10);
  const minutes = parseInt((recipe.minutes ?? 0).toString(), 10);
  const description = recipe.description.trim().replace(/\s+/g, " ") ?? "";
  const steps = recipe.steps.map((step) => step.trim().replace(/\s+/g, " "));

  return { name, hours, minutes, description, steps };
};

export const getNewProductData = (product: IngredientNewProduct) => {
  const { name, brand, purchasedFrom, link } = sanitizeProductData(product);
  return [name, brand, purchasedFrom, link];
};

export const sanitizeProductData = (product: IngredientNewProduct) => {
  const name = product?.name.trim() ?? "";
  const brand = lightSlugify(product?.brand ?? "");
  const purchasedFrom = lightSlugify(product?.purchasedFrom ?? "");
  const link = product?.link?.trim() ?? "";

  return { name, brand, purchasedFrom, link };
};
