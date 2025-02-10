import { PRODUCT_QUERY_TYPES } from "./const.js";
import { ProductQueryTypes } from "./type.js";

export const isValidProductQueryType = (
  type: string
): type is ProductQueryTypes => {
  return Object.values(PRODUCT_QUERY_TYPES).includes(type as ProductQueryTypes);
};
