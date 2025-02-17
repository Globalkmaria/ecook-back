type IngredientData = {
  ingredient_id: string;
  ingredient_name: string;
  ingredient_quantity: number;
  product_id: null;
  product_name: null;
  product_brand: null;
  product_purchased_from: null;
  product_img: null;
  product_quantity: null;
};

type ProductData = {
  ingredient_id: string;
  ingredient_name: string;
  ingredient_quantity: null;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_purchased_from: string;
  product_img: string;
  product_quantity: number;
};

export type CartItemData = IngredientData | ProductData;

type CartItemProduct = {
  key: string;
  name: string;
  brand: string;
  purchasedFrom: string;
  img: string;
  quantity: number;
};

export interface CartItemInfo {
  ingredient: { name: string; key: string; quantity: number | null };
  products: CartItemProduct[];
}
