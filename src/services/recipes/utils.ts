import { config } from "../../config/index.js";
import { decrypt, encrypt } from "../../utils/encrypt.js";
import { sanitizeURL } from "../../utils/normalize.js";
import { RecipesSimple } from "./type.js";

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

export const generateRecipeKey = (id: RecipesSimple["id"], name: string) =>
  `${encrypt(
    id.toString(),
    config.key.recipe.key,
    config.key.recipe.iv
  )}-${sanitizeURL(name)}`;
