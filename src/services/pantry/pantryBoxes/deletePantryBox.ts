import mysqlDB from "../../../db/mysql";

export const deletePantryBox = async (pantryBoxId: number) => {
  await mysqlDB.execute(`DELETE FROM pantry_boxes WHERE id = ?;`, [
    pantryBoxId,
  ]);
};
