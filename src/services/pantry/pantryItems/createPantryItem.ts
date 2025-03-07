import { ResultSetHeader } from "mysql2";

import mysqlDB from "../../../db/mysql.js";
import { arrayToPlaceholders } from "../../../utils/query.js";
import { linkPantryItemToBox } from "../pantryBoxItemsJC/index.js";

type CreatePantryItemProps = {
  pantryBoxId: number;
} & PantryItemData;

export const createPantryItem = async ({
  pantryBoxId,
  ...restProps
}: CreatePantryItemProps) => {
  const pantryItemId = await insertPantryItem(restProps);

  await linkPantryItemToBox(pantryItemId, pantryBoxId);

  return pantryItemId;
};

interface PantryItemData {
  userId: number;
  buyDate: string;
  expirationDate: string;
  quantity: number;
}

const insertPantryItem = async (props: PantryItemData) => {
  const values = [
    props.buyDate,
    props.expirationDate,
    props.quantity,
    props.userId,
  ];
  const placeholder = arrayToPlaceholders(values);

  const [result] = await mysqlDB.execute<ResultSetHeader>(
    `INSERT INTO pantry_items (buy_date, expiration_date, quantity, user_id)
      VALUES (${placeholder});`,
    values
  );

  return result.insertId;
};
