import { PRODUCT_QUERY_TYPES } from "./const.js";

export interface ClientProduct {
  id: number;
  ingredient: {
    id: number;
    name: string;
  };
  userId: number;
  name: string;
  brand: string;
  purchasedFrom: string;
  link: string | null;
  img: string;
  createdAt: Date;
  updatedAt: Date;
  key: string;
}

export interface GetProductsQuery {
  type: string;
  q: string;
}

export type GetProductsResponse = {
  ingredientId: number | null;
  products: ClientProduct[];
};
export type ProductQueryTypes =
  (typeof PRODUCT_QUERY_TYPES)[keyof typeof PRODUCT_QUERY_TYPES];
