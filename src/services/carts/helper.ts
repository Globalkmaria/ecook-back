import { GetCartItemsByUserResponse } from "../../controllers/carts/getCartItemsByUser";
import { getImgUrl } from "../../utils/img";
import { generateIngredientKey } from "../ingredients/utils";
import { generateProductKey } from "../products/utils";

import { CartItemData, CartItemInfo } from "./type";

export const generateClientCartItems = (
  cartItems: CartItemData[]
): GetCartItemsByUserResponse["items"] => {
  const clientCartItems: {
    [ingredientKey: string]: CartItemInfo;
  } = {};

  for (const cartItem of cartItems) {
    const ingredientKey = generateIngredientKey(
      cartItem.ingredient_id,
      cartItem.ingredient_name
    );

    if (ingredientKey && !clientCartItems[ingredientKey]) {
      clientCartItems[ingredientKey] = {
        ingredient: {
          name: cartItem.ingredient_name,
          key: ingredientKey,
          quantity: null,
        },
        products: [],
      };
    }
    if (cartItem.product_id) {
      const productKey = generateProductKey(
        cartItem.product_id,
        cartItem.product_name
      );

      if (productKey) {
        clientCartItems[ingredientKey].products.push({
          key: productKey,
          name: cartItem.product_name,
          brand: cartItem.product_brand,
          purchasedFrom: cartItem.product_purchased_from,
          img: getImgUrl(cartItem.product_img, true),
          quantity: cartItem.product_quantity,
        });
      }
    } else {
      clientCartItems[ingredientKey].ingredient.quantity =
        cartItem.ingredient_quantity;
    }
  }

  return Object.values(clientCartItems);
};
