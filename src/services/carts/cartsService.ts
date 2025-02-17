import { ResultSetHeader } from "mysql2";
import mysqlDB from "../../db/mysql.js";
import { ServiceError } from "../helpers/ServiceError.js";
import { decryptKeyAndGetIngredientId } from "../ingredients/utils.js";
import { decryptKeyAndGetProductId } from "../products/utils.js";

interface RemoveCartItemParams {
  userId: number;
  ingredientKey?: string;
  productKey?: string;
}

export const removeCartItem = async (params: RemoveCartItemParams) => {
  const { userId, ingredientKey, productKey } = params;
  const ingredientId =
    ingredientKey && decryptKeyAndGetIngredientId(ingredientKey);
  const productId = productKey && decryptKeyAndGetProductId(productKey);

  const [result] = await mysqlDB.execute<ResultSetHeader>(
    `DELETE * FROM carts
        WHERE user_id = ? 
            AND ingredient_id = ? 
            AND product_id = ?`,
    [userId, ingredientId, productId ?? null]
  );

  return result;
};

interface UpdateCartItemQuantityParams {
  userId: number;
  ingredientKey?: string;
  productKey?: string;
  quantity: number;
}

export const updateCartItemQuantity = async ({
  userId,
  ingredientKey,
  productKey,
  quantity,
}: UpdateCartItemQuantityParams) => {
  const ingredientId =
    ingredientKey && decryptKeyAndGetIngredientId(ingredientKey);
  const productId = productKey && decryptKeyAndGetProductId(productKey);

  if (!ingredientId) {
    throw new ServiceError(400, "Invalid ingredient key");
  }

  if (productKey && !productId) {
    throw new ServiceError(400, "Invalid product key");
  }

  const result = await mysqlDB.execute<ResultSetHeader>(
    `UPDATE carts
        SET quantity = ?
        WHERE user_id = ? 
            AND ingredient_id = ? 
            AND product_id = ?`,
    [quantity, userId, ingredientId, productId ?? null]
  );

  return result;
};
