import { ResultSetHeader } from "mysql2";

import mysqlDB from "../../../db/mysql.js";
import { deletePantryBox } from "../pantryBoxes/deletePantryBox.js";
import { getPantryItemsByItemId } from "../pantryBoxItemsJC/index.js";
import { ServiceError } from "../../helpers/ServiceError.js";

export const deletePantryItem = async (
  pantryItemId: number,
  userId: number
) => {
  const pantryItems = await getPantryItemsByItemId(pantryItemId);
  if (pantryItems.length < 2) {
    await deletePantryBox(pantryItems[0].pantry_box_id);
  }

  await deleteItemFromPantryDB(pantryItemId, userId);
};

const deleteItemFromPantryDB = async (pantryItemId: number, userId: number) => {
  const [result] = await mysqlDB.execute<ResultSetHeader>(
    `DELETE FROM pantry_items WHERE id = ? AND user_id = ?;`,
    [pantryItemId, userId]
  );
  if (!result.affectedRows) {
    throw new ServiceError(
      400,
      "Pantry item not found or not owned by the user."
    );
  }
};
