import {
  RECIPES_BATCH_SEARCH_TYPES,
  RecipesBatchSearchTypes,
} from "../../controllers/recipes/recipesBatchController";
import mysqlDB from "../../db/mysql";
import { decryptRecipeURLAndGetRecipeId } from "./utils";
import { formatSearchResult } from "./recipesSearchService";
import { RecipesSimple } from "./type";

export const getBatchRecipes = async ({
  type,
  query,
}: {
  type: RecipesBatchSearchTypes;
  query: string[];
}) => {
  let data: RecipesSimple[] = [];

  if (type === RECIPES_BATCH_SEARCH_TYPES.KEYS) {
    data = await searchByKeys(query);
  }

  return formatSearchResult(data);
};

const searchByKeys = async (keys: string[]) => {
  const ids = keys
    .map((key) => decryptRecipeURLAndGetRecipeId(key))
    .filter((id) => id !== null);

  const [result] = await mysqlDB.query<RecipesSimple[]>(
    `SELECT * FROM recipes_simple_view WHERE id IN (?)`,
    [ids]
  );

  return result;
};
