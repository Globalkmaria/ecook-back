import mysqlDB from "../../../db/mysql";
import { getPantryItemsByUserId } from "../pantryItems/getPantryItem";
import { PantryBoxInfoServerData } from "./type";
import { mapPantryBoxesToResponse } from "./helper";

export const getPantryBoxes = async (userId: number) => {
  const pantryBoxes = await getPantryBoxesInfoByUserId(userId);
  if (pantryBoxes.length === 0) {
    return [];
  }

  const pantryItems = await getPantryItemsByUserId(userId);

  const pantryBoxesInfo = mapPantryBoxesToResponse(pantryBoxes, pantryItems);

  return pantryBoxesInfo;
};

const getPantryBoxesInfoByUserId = async (userId: number) => {
  const [pantryBoxes] = await mysqlDB.execute<PantryBoxInfoServerData[]>(
    `SELECT  
        box.id as id,
        p.img as img, 
        i.name as ingredient_name,
        p.name as product_name
      FROM pantry_boxes box
      JOIN ingredients i
        on box.ingredient_id = i.id
      LEFT JOIN product_detail_view p
        on box.product_id = p.id
      WHERE box.user_id = ?`,
    [userId]
  );

  return pantryBoxes;
};
