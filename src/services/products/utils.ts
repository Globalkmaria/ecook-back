import { config } from "../../config/index";
import { decrypt, encrypt } from "../../utils/encrypt";
import { sanitizeURL } from "../../utils/normalize";

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

  return Number(productId);
};

export const decryptProductKeyWithThrowError = (url: string) => {
  const productId = decryptKeyAndGetProductId(url);
  if (!productId) {
    throw new Error("Invalid product key");
  }
  return productId;
};

export const generateProductKey = (id: string | number, name: string) =>
  `${encrypt(
    id.toString(),
    config.key.product.key,
    config.key.product.iv
  )}-${sanitizeURL(name)}`;
