import { ResultSetHeader } from "mysql2";
import { PoolConnection } from "mysql2/promise";

import mysqlDB from "../../../db/mysql";

import { PantryBoxItemLink } from "./type";

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

export const getPantryBoxItems = async (pantryItemId: string | number) => {
  const [result] = await mysqlDB.execute<PantryBoxItemLink[]>(
    `WITH j1 AS (SELECT pantry_box_id FROM pantry_box_items WHERE pantry_item_id = ?) 
SELECT * FROM j1
JOIN pantry_box_items j2
ON j1.pantry_box_id = j2.pantry_box_id; ;`,
    [pantryItemId]
  );

  return result;
};
