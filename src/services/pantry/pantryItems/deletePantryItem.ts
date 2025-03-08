import { ResultSetHeader } from "mysql2";

import mysqlDB from "../../../db/mysql";
import { ServiceError } from "../../helpers/ServiceError";
import { deletePantryBox } from "../pantryBoxes/deletePantryBox";
import { getPantryBoxItems } from "../pantryBoxItemsJC/index";

export const deletePantryItem = async (
  pantryItemId: number,
  userId: number
): Promise<{
  pantryBoxDeleted: boolean;
}> => {
  const pantryItems = await getPantryBoxItems(pantryItemId);
  if (pantryItems.length < 2) {
    await deletePantryBox(pantryItems[0].pantry_box_id);
    return {
      pantryBoxDeleted: true,
    };
  }

  await deleteItemFromPantryDB(pantryItemId, userId);
  return {
    pantryBoxDeleted: false,
  };
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
