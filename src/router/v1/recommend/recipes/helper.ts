import { shuffleArray } from "../../../../utils/shuffle";
import { RecommendRecipe } from "../type";

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
