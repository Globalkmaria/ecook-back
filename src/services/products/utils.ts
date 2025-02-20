import { config } from "../../config/index.js";
import { decrypt, encrypt } from "../../utils/encrypt.js";
import { sanitizeURL } from "../../utils/normalize.js";

export const decryptKeyAndGetProductId = (url: string) => {
  const [ciphertext] = url.split("-");

  if (ciphertext.length !== 32) {
    return null;
  }

  const productId = decrypt(
    ciphertext,
    config.key.product.key,
    config.key.product.iv
  );

  return productId;
};

export const generateProductKey = (id: string | number, name: string) =>
  `${encrypt(
    id.toString(),
    config.key.product.key,
    config.key.product.iv
  )}-${sanitizeURL(name)}`;
