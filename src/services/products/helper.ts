import { ClientProduct } from "../../controllers/products/type.js";
import { generateProductKey } from "../../router/v1/products/helper.js";
import { getImgUrl } from "../../utils/img.js";
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
