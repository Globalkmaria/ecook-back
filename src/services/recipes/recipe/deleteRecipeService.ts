import mysqlDB from "../../../db/mysql";

import { RecipeInfo } from "./type";

export const getRecipe = async (recipeId: string) => {
  const [recipes] = await mysqlDB.execute<RecipeInfo[]>(
    `SELECT * FROM recipes WHERE id = ?`,
    [recipeId]
  );

  return recipes[0];
};

export const deleteRecipeById = async (recipeId: string) => {
  await mysqlDB.query(`DELETE FROM recipes WHERE id = ?`, [recipeId]);
};
