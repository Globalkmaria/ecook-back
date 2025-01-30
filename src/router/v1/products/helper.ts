import { config } from "../../../config/index.js";
import { decrypt, encrypt } from "../../../utils/encrypt";
import { lightSlugify } from "../../../utils/normalize.js";
import { Product } from "./index.js";

export const decryptRecipeURLAndGetProductId = (url: string) => {
  const [ciphertext] = url.split("-");

  if (ciphertext.length !== 32) {
    return null;
  }

  const productId = decrypt(
    ciphertext,
    config.key.recipe.key,
    config.key.recipe.iv
  );

  return productId;
};

export const generateProductKey = (id: Product["id"], name: string) =>
  `${encrypt(
    id.toString(),
    config.key.recipe.key,
    config.key.recipe.iv
  )}-${lightSlugify(name)}`;
