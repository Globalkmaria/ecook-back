import { ResultSetHeader } from "mysql2";

import mysqlDB from "../../../db/mysql.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { camelToSnake } from "../../../utils/keysToSnakeCase.js";

const fields = ["buy_date", "expire_date", "quantity"];

interface UpdatePantryItemProps {
  pantryItemId: number;
  name: string;
  value: string;
  userId: number;
}

export const updatePantryItem = async (props: UpdatePantryItemProps) => {
  const { pantryItemId, name, value, userId } = props;
  const formattedName = camelToSnake(name);
  if (!fields.includes(formattedName)) {
    throw new ServiceError(400, "Invalid field name");
  }

  const [result] = await mysqlDB.execute<ResultSetHeader>(
    `UPDATE pantry_items
      SET ${formattedName} = ?
      WHERE id = ? AND user_id = ?;`,
    [value, pantryItemId, userId]
  );

  if (result.affectedRows === 0) {
    throw new ServiceError(
      400,
      "Invalid pantry item ID or not owned by the user"
    );
  }
};
