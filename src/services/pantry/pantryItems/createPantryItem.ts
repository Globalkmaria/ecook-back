import { ResultSetHeader } from "mysql2";

import mysqlDB from "../../../db/mysql";
import { arrayToPlaceholders } from "../../../utils/query";
import { linkPantryItemToBox } from "../pantryBoxItemsJC/index";
import { PoolConnection } from "mysql2/promise";

type CreatePantryItemProps = {
  pantryBoxId: number;
} & PantryItemData;

export const createPantryItem = async (
  { pantryBoxId, ...restProps }: CreatePantryItemProps,
  connection?: PoolConnection
) => {
  const pantryItemId = await insertPantryItem(restProps, connection);

  await linkPantryItemToBox(pantryItemId, pantryBoxId, connection);

  return pantryItemId;
};

interface PantryItemData {
  userId: number;
  buyDate: string;
  expireDate: string;
  quantity: number;
}

const insertPantryItem = async (
  props: PantryItemData,
  connection?: PoolConnection
) => {
  const connect = connection || mysqlDB;
  const values = [
    props.buyDate,
    props.expireDate,
    props.quantity,
    props.userId,
  ];
  const placeholder = arrayToPlaceholders(values);

  const [result] = await connect.execute<ResultSetHeader>(
    `INSERT INTO pantry_items (buy_date, expire_date, quantity, user_id)
      VALUES (${placeholder});`,
    values
  );

  return result.insertId;
};
