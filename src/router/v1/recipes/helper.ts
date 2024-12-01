import { config } from "../../../config/index.js";
import { encrypt } from "../../../utils/encrypt.js";
import { lightSlugify } from "../../../utils/normalize.js";
import { INewRecipe, RecipesSimple } from "./index.js";

export const generateRecipeKey = (id: RecipesSimple["id"], name: string) =>
  `${encrypt(
    id.toString(),
    config.key.recipe.key,
    config.key.recipe.iv
  )}-${lightSlugify(name)}`;

export const getNewRecipeData = (recipe: INewRecipe, userId: number) => {
  const name = recipe.name.trim().replace(/\s+/g, " ");
  const hours = parseInt((recipe.hours ?? 0).toString(), 10);
  const minutes = parseInt((recipe.minutes ?? 0).toString(), 10);
  const description = recipe.description.trim().replace(/\s+/g, " ") ?? "";

  return [name, userId, hours, minutes, description, recipe.steps];
};
