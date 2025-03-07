import mysqlDB from "../../../db/mysql.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { getPantryItemsByUserId } from "../pantryItems/getPantryItem.js";
import { PantryBoxInfoServerData } from "./type.js";
import { mapPantryBoxesToResponse } from "./helper.js";

export const getPantryBoxes = async (userId: number) => {
  const pantryBoxes = await getPantryBoxesInfoByUserId(userId);

  const pantryItems = await getPantryItemsByUserId(userId);

  const pantryBoxInfo = mapPantryBoxesToResponse(pantryBoxes, pantryItems);

  return pantryBoxInfo;
};

const getPantryBoxesInfoByUserId = async (userId: number) => {
  const [pantryBoxes] = await mysqlDB.execute<PantryBoxInfoServerData[]>(
    `SELECT  
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

  if (!pantryBoxes.length) {
    throw new ServiceError(400, "Pantry box not found");
  }

  return pantryBoxes;
};
