import mysqlDB from "../../../db/mysql";
import { ServiceError } from "../../helpers/ServiceError";
import { GetPantryItemsByUserIdRes, PantryItemServerData } from "./type";

export const getPantryItemById = async (pantryItemId: number) => {
  const [result] = await mysqlDB.execute<PantryItemServerData[]>(
    `SELECT * FROM pantry_items WHERE id = ?;`,
    [pantryItemId]
  );

  if (result.length === 0) {
    throw new ServiceError(404, "Pantry item not found");
  }

  return result[0];
};

export const getPantryItems = async (pantryBoxId: number) => {
  const [result] = await mysqlDB.execute<PantryItemServerData[]>(
    `SELECT * 
      FROM pantry_box_items jc 
      JOIN pantry_items i
        ON jc.pantry_item_id = i.id
      WHERE jc.pantry_box_id = ? 
      ORDER BY i.expire_date ASC, buy_date ASC, i.id ASC;`,
    [pantryBoxId]
  );

  if (result.length === 0) {
    throw new ServiceError(404, "Pantry item not found");
  }

  return result;
};

export const getPantryItemsByUserId = async (userId: number) => {
  const [result] = await mysqlDB.execute<GetPantryItemsByUserIdRes[]>(
    `SELECT * 
      FROM pantry_items  i
      JOIN pantry_box_items jc
        ON i.id = jc.pantry_item_id
      WHERE user_id = ?
      ORDER BY i.expire_date ASC, buy_date ASC, i.id ASC;
    `,
    [userId]
  );

  if (result.length === 0) {
    throw new ServiceError(404, "Pantry item not found");
  }

  return result;
};
