import { config } from "../../config/index.js";
import { IngredientsBatchBody } from "../../controllers/ingredients/ingredientsBatchController.js";
import { decrypt, encrypt } from "../../utils/encrypt.js";
import { sanitizeURL } from "../../utils/normalize.js";
import { decryptKeyAndGetProductId } from "../products/utils.js";

export const decryptKeyAndGetIngredientId = (key: string) => {
  const [ciphertext] = key.split("-");

  if (ciphertext.length !== 32) {
    return null;
  }

  const ingredientId = decrypt(
    ciphertext,
    config.key.ingredient.key,
    config.key.ingredient.iv
  );

  return ingredientId;
};

export const generateIngredientKey = (id: number | string, name: string) =>
  `${encrypt(
    id.toString(),
    config.key.ingredient.key,
    config.key.ingredient.iv
  )}-${sanitizeURL(name)}`;

export const extractIngredientAndProductIds = (
  items: IngredientsBatchBody["items"]
) => {
  const init: [string[], string[]] = [[], []];

  const ingredientKeys = Object.keys(items);

  const [ingredientIds, productIds] = ingredientKeys.reduce(
    (acc, ingredientKey) => {
      const productKeys = items[ingredientKey].productKeys;

      if (productKeys?.length) {
        const productIds = productKeys
          ?.map((key) => decryptKeyAndGetProductId(key))
          .filter((id) => id !== null);
        acc[1].push(...productIds);
      } else {
        const ingredientId = decryptKeyAndGetIngredientId(ingredientKey);
        ingredientId && acc[0].push(ingredientId);
      }

      return acc;
    },
    init
  );

  return { ingredientIds, productIds };
};
