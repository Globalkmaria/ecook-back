import { IngredientsBatchResponse } from "../../controllers/ingredients/ingredientsBatchController.js";
import { getImgUrl } from "../../utils/img.js";
import { generateProductKey } from "../products/utils.js";
import { IngredientProductQueryResult } from "./type.js";
import { generateIngredientKey } from "./utils.js";

export const mapQueryResultToBatchResponse = (
  ingredients: IngredientProductQueryResult[]
): IngredientsBatchResponse => {
  const response: IngredientsBatchResponse = {};

  ingredients.forEach((ingredient) => {
    const ingredientKey = generateIngredientKey(
      ingredient.ingredient_id,
      ingredient.ingredient_name
    );

    const productKey = ingredient.product_id
      ? generateProductKey(ingredient.product_id, ingredient.product_name)
      : null;

    if (!response[ingredientKey]) {
      response[ingredientKey] = {
        ingredient: {
          name: ingredient.ingredient_name,
          key: ingredientKey,
        },
        products: {},
      };
    }

    if (productKey) {
      response[ingredientKey].products[productKey] = {
        name: ingredient.product_name,
        brand: ingredient.product_brand,
        purchasedFrom: ingredient.product_purchased_from,
        img: getImgUrl(ingredient.product_img, true),
        key: productKey,
      };
    }
  });

  return response;
};
