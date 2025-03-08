import { ResultSetHeader } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { PantryBoxOriginalData } from "./type";

interface CreatePantryBoxProps {
  userId: number;
  ingredientId: number;
  productId: number | null;
}

export const createPantryBox = async (
  props: CreatePantryBoxProps,
  connection: PoolConnection
) => {
  const values = [props.userId, props.ingredientId, props.productId ?? null];

  const query = props.productId
    ? `SELECT * FROM pantry_boxes WHERE user_id = ? AND ingredient_id = ? AND product_id = ?;`
    : `SELECT * FROM pantry_boxes WHERE user_id = ? AND ingredient_id = ? AND product_id IS NULL;`;

  const queryParams = props.productId
    ? [props.userId, props.ingredientId, props.productId]
    : [props.userId, props.ingredientId];

  const [existing] = await connection.execute<PantryBoxOriginalData[]>(
    query,
    queryParams
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO pantry_boxes (user_id, ingredient_id, product_id) VALUES (?, ?, ?);`,
    values
  );

  return result.insertId;
};
