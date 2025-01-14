import { config } from "../../../../config/index.js";
import { decrypt } from "../../../../utils/encrypt.js";
import { getImgUrl } from "../../../../utils/img.js";
import { shuffleArray } from "../../../../utils/shuffle.js";
import { generateRecipeKey, sanitizeRecipeData } from "../../recipes/helper.js";
import { RecommendRecipe } from "../../recommend/type.js";
import { EditRecipe, RecipeInfo } from "./recipe.js";

export const decryptRecipeURLAndGetRecipeId = (url: string) => {
  const [ciphertext] = url.split("-");

  if (ciphertext.length !== 32) {
    return null;
  }

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

export const formatRecipeData = (recipes: RecommendRecipe[]) =>
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
