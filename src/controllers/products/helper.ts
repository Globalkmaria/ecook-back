import { ProductQueryTypes } from "../../services/products/type";
import { PRODUCT_QUERY_TYPES } from "./const";

export const isValidProductQueryType = (
  type: string
): type is ProductQueryTypes => {
  return Object.values(PRODUCT_QUERY_TYPES).includes(type as ProductQueryTypes);
};
