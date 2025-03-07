import { ResultSetHeader, RowDataPacket } from "mysql2";
import mysqlDB from "../../../db/mysql.js";

interface CreatePantryBoxProps {
  userId: number;
  ingredientId: number;
  productId?: number;
}

export const createPantryBox = async (props: CreatePantryBoxProps) => {
  const { fields, values } = filterInputsAndValues(props);

  const whereClause = fields.map((field) => `${field} = ?`).join(" AND ");
  const [existing] = await mysqlDB.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM pantry_boxes WHERE ${whereClause}`,
    values
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const query = fields.join(", ");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await mysqlDB.execute<ResultSetHeader>(
    `INSERT INTO pantry_boxes (${query}) VALUES (${placeholders});`,
    values
  );

  return result.insertId;
};

const filterInputsAndValues = ({
  userId,
  ingredientId,
  productId,
}: {
  userId: number;
  ingredientId: number;
  productId?: number;
}) => {
  const fields = [
    "user_id",
    "ingredient_id",
    productId ? "product_id" : null,
  ].filter(Boolean);
  const values = [userId, ingredientId, productId].filter(Boolean);
  return { fields, values };
};
