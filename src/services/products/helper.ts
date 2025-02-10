import { config } from "../../config/index.js";
import { ClientProduct } from "../../controllers/products/type.js";
import { decrypt, encrypt } from "../../utils/encrypt.js";
import { getImgUrl } from "../../utils/img.js";
import { sanitizeURL } from "../../utils/normalize.js";
import { Product } from "./type.js";

export const formatClientProducts = (data: Product[]): ClientProduct[] =>
  data.map((product) => ({
    id: product.id,
    ingredient: {
      id: product.ingredient_id,
      name: product.ingredient_name,
    },
    userId: product.user_id,
    name: product.name,
    brand: product.brand,
    purchasedFrom: product.purchased_from,
    link: product.link,
    img: getImgUrl(product.img, true),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    key: generateProductKey(product.id, product.name),
  }));
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
  )}-${sanitizeURL(name)}`;
