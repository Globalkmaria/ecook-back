import { ResultSetHeader, RowDataPacket } from "mysql2";

import mysqlDB from "../../db/mysql";
import { decryptIngredientKeyWithThrowError } from "../ingredients/utils";
import { decryptProductKeyWithThrowError } from "../products/utils";

interface RemoveCartItemParams {
  userId: number;
  ingredientKey?: string;
  productKey?: string;
}

export const removeCartItem = async (params: RemoveCartItemParams) => {
  const { userId, ingredientKey, productKey } = params;
  const ingredientId =
    ingredientKey && decryptIngredientKeyWithThrowError(ingredientKey);
  const productId = productKey && decryptProductKeyWithThrowError(productKey);

  if (productId) {
    const [result] = await mysqlDB.execute<ResultSetHeader>(
      `DELETE FROM carts
        WHERE user_id = ? 
            AND ingredient_id = ? 
            AND product_id = ?`,
      [userId, ingredientId, productId]
    );
    return result;
  }
  const [result] = await mysqlDB.execute<ResultSetHeader>(
    `DELETE FROM carts
      WHERE user_id =? 
        AND ingredient_id =?
        AND product_id IS NULL
    `,
    [userId, ingredientId]
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
    ingredientKey && decryptIngredientKeyWithThrowError(ingredientKey);
  const productId = productKey && decryptProductKeyWithThrowError(productKey);

  const productQuery = productId
    ? "AND product_id = ?"
    : "AND product_id IS NULL";

  const productQueryValues = productId
    ? [quantity, userId, ingredientId, productId]
    : [quantity, userId, ingredientId];

  await mysqlDB.execute<ResultSetHeader>(
    `UPDATE carts
        SET quantity = ?
        WHERE user_id = ? 
            AND ingredient_id = ? 
            ${productQuery}
    `,
    productQueryValues
  );

  const getQueryValues = productId
    ? [userId, ingredientId, productId]
    : [userId, ingredientId];
  const [result] = await mysqlDB.execute<
    ({ quantity: number } & RowDataPacket)[]
  >(
    `SELECT quantity FROM carts
    WHERE user_id = ?
      AND ingredient_id = ?
      ${productQuery}`,
    getQueryValues
  );

  return result[0].quantity;
};

export const createCartItem = async ({
  userId,
  ingredientKey,
  productKey,
}: {
  userId: number;
  ingredientKey: string;
  productKey?: string;
}) => {
  const ingredientId =
    ingredientKey && decryptIngredientKeyWithThrowError(ingredientKey);
  const productId = productKey && decryptProductKeyWithThrowError(productKey);

  const productQuery = productId
    ? "AND product_id = ?"
    : "AND product_id IS NULL";

  const productQueryValues = productId
    ? [userId, ingredientId, productId]
    : [userId, ingredientId];
  const [existingCartItem] = await mysqlDB.execute<
    ({ quantity: number } & RowDataPacket)[]
  >(
    `SELECT * FROM carts
        WHERE user_id =? 
            AND ingredient_id =? 
            ${productQuery}`,
    productQueryValues
  );

  if (existingCartItem.length > 0) {
    const newQuantity = existingCartItem[0].quantity + 1;

    await updateCartItemQuantity({
      userId,
      ingredientKey,
      productKey,
      quantity: newQuantity,
    });

    return newQuantity;
  }

  if (productId) {
    await mysqlDB.execute<ResultSetHeader>(
      `INSERT INTO carts (user_id, ingredient_id, product_id, quantity)
            VALUES (?, ?, ?, ?)`,
      [userId, ingredientId, productId, 1]
    );
  } else {
    await mysqlDB.execute<ResultSetHeader>(
      `INSERT INTO carts (user_id, ingredient_id, quantity)
            VALUES (?, ?, ?)`,
      [userId, ingredientId, 1]
    );
  }

  return 1;
};
