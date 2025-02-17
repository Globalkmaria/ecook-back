import { IngredientsBatchResponse } from "../../controllers/ingredients/ingredientsBatchController.js";
import { getImgUrl } from "../../utils/img.js";
import { generateProductKey } from "../products/utils.js";
import { IngredientProduct, SimpleIngredient } from "./type.js";
import { generateIngredientKey } from "./utils.js";

export const mapQueryResultToBatchResponse = ({
  ingredients,
  products,
}: {
  ingredients: SimpleIngredient[];
  products: IngredientProduct[];
}): IngredientsBatchResponse => {
  const response: IngredientsBatchResponse = {};

  ingredients.forEach((ingredient) => {
    const ingredientKey = generateIngredientKey(
      ingredient.ingredient_id,
      ingredient.ingredient_name
    );

    response[ingredientKey] = {
      ingredient: {
        name: ingredient.ingredient_name,
        key: ingredientKey,
      },
      products: {},
    };
  });

  products.forEach((product) => {
    const ingredientKey = generateIngredientKey(
      product.ingredient_id,
      product.ingredient_name
    );
    const productKey = generateProductKey(
      product.product_id,
      product.product_name
    );

    if (!response[ingredientKey]) {
      response[ingredientKey] = {
        ingredient: {
          name: product.ingredient_name,
          key: ingredientKey,
        },
        products: {},
      };
    }

    response[ingredientKey].products[productKey] = {
      name: product.product_name,
      brand: product.product_brand,
      purchasedFrom: product.product_purchased_from,
      img: getImgUrl(product.product_img, true),
      key: productKey,
    };
  });

  return response;
};
