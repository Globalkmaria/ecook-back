import { ProductQueryTypes } from "../../services/products/type.js";
import { PRODUCT_QUERY_TYPES } from "./const.js";

export const isValidProductQueryType = (
  type: string
): type is ProductQueryTypes => {
  return Object.values(PRODUCT_QUERY_TYPES).includes(type as ProductQueryTypes);
};
