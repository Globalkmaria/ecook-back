import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise.js";

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

  const [existing] = await connection.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM pantry_boxes WHERE user_id = ? AND ingredient_id = ? AND product_id = ?;`,
    values
  );

  if (existing[0].count > 0) {
    return existing[0].id;
  }

  const createValues = values.filter(Boolean);
  const query =
    createValues.length > 2
      ? "user_id, ingredient_id, product_id"
      : "user_id, ingredient_id";
  const placeholders = createValues.map(() => "?").join(",");

  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO pantry_boxes (${query}) VALUES (${placeholders});`,
    values
  );

  return result.insertId;
};
