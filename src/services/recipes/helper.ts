import { lightTrim, lightSlugify } from "../../utils/normalize";

import { INewRecipe, IngredientNewProduct } from "./type";

export const getNewRecipeData = (recipe: INewRecipe, userId: number) => {
  const { name, hours, minutes, description, steps } =
    sanitizeRecipeData(recipe);
  return [name, userId, hours, minutes, description, steps];
};

export const sanitizeRecipeData = (recipe: INewRecipe) => {
  const name = lightTrim(recipe.name);
  const hours = parseInt((recipe.hours ?? 0).toString(), 10);
  const minutes = parseInt((recipe.minutes ?? 0).toString(), 10);
  const description = lightTrim(recipe.description ?? "");
  const steps = recipe.steps.map((step) => lightTrim(step));

  return { name, hours, minutes, description, steps };
};

export const getNewProductData = (product: IngredientNewProduct) => {
  const { name, brand, purchasedFrom, link } = sanitizeProductData(product);
  return [name, brand, purchasedFrom, link];
};

export const sanitizeProductData = (product: IngredientNewProduct) => {
  const name = lightTrim(product?.name ?? "");
  const brand = lightSlugify(product?.brand ?? "");
  const purchasedFrom = lightSlugify(product?.purchasedFrom ?? "");
  const link = product?.link?.trim() ?? "";

  return { name, brand, purchasedFrom, link };
};
