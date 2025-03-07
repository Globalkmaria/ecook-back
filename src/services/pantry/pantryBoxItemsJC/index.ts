import { ResultSetHeader } from "mysql2";

import mysqlDB from "../../../db/mysql.js";
import { PantryBoxItemLink } from "./type.js";
import { PoolConnection } from "mysql2/promise.js";

export const linkPantryItemToBox = async (
  pantryItemId: number,
  pantryBoxId: number,
  connection?: PoolConnection
) => {
  const connect = connection || mysqlDB;
  await connect.execute<ResultSetHeader>(
    `INSERT INTO pantry_box_items (pantry_item_id, pantry_box_id)
            VALUES (?,?);`,
    [pantryItemId, pantryBoxId]
  );
};

export const unlinkPantryItemFromBox = async (pantryItemId: number) => {
  await mysqlDB.execute(
    `DELETE FROM pantry_box_items WHERE pantry_item_id = ?`,
    [pantryItemId]
  );
};

export const unlinkPantryBoxFromItems = async (pantryBoxId: number) => {
  await mysqlDB.execute(
    `DELETE FROM pantry_box_items WHERE pantry_box_id = ?`,
    [pantryBoxId]
  );
};

export const getPantryItemsByItemId = async (pantryItemId: string | number) => {
  const [result] = await mysqlDB.execute<PantryBoxItemLink[]>(
    `SELECT * FROM pantry_box_items 
        WHERE pantry_item_id = ${pantryItemId} ;`
  );

  return result;
};
