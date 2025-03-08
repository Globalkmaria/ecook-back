import { getImgUrl } from "../../utils/img";
import { generateIngredientKey } from "../ingredients/utils";

import { ClientProduct, Product } from "./type";
import { generateProductKey } from "./utils";

export const formatClientProduct = (product: Product): ClientProduct => ({
  id: product.id,
  ingredient: {
    id: product.ingredient_id,
    name: product.ingredient_name,
    key: generateIngredientKey(product.ingredient_id, product.ingredient_name),
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
});

export const formatClientProducts = (data: Product[]): ClientProduct[] =>
  data.map((product) => formatClientProduct(product));
