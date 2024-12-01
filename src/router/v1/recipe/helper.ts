import { config } from "../../../config/index.js";
import { decrypt } from "../../../utils/encrypt.js";

export const decryptRecipeURLAndGetRecipeId = (url: string) => {
  const [ciphertext] = url.split("-");

  const recipeId = decrypt(
    ciphertext,
    config.key.recipe.key,
    config.key.recipe.iv
  );

  return recipeId;
};
