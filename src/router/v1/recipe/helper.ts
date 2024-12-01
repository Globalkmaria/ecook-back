import { config } from "../../../config/index.js";
import { decrypt } from "../../../utils/encrypt.js";
import { sanitizeRecipeData } from "../recipes/helper.js";
import { EditRecipe, RecipeInfo } from "./index.js";

export const decryptRecipeURLAndGetRecipeId = (url: string) => {
  const [ciphertext] = url.split("-");

  const recipeId = decrypt(
    ciphertext,
    config.key.recipe.key,
    config.key.recipe.iv
  );

  return recipeId;
};

export const getUpdatedRecipeData = (
  info: EditRecipe,
  currentRecipe: RecipeInfo
) => {
  const updates = new Map<string, any>();

  const { name, hours, minutes, description, steps } = sanitizeRecipeData(info);

  if (name !== currentRecipe.name) updates.set("name", name);
  if (hours !== currentRecipe.hours) updates.set("hours", hours);
  if (minutes !== currentRecipe.minutes) updates.set("minutes", minutes);
  if (description !== currentRecipe.description)
    updates.set("description", description);
  if (steps.join("") !== currentRecipe.steps.join(""))
    updates.set("steps", info.steps);

  return updates;
};
