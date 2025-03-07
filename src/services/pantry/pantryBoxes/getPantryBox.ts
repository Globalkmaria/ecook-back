import mysqlDB from "../../../db/mysql.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { getPantryItems } from "../pantryItems/getPantryItem.js";
import { PantryBoxInfoServerData, PantryBoxOriginalData } from "./type.js";
import { mapPantryBoxToResponse } from "./helper.js";

export const getPantryBox = async (pantryBoxId: number) => {
  const pantryBox = await getPantryBoxInfo(pantryBoxId);

  const pantryItems = await getPantryItems(pantryBoxId);

  const pantryBoxInfo = mapPantryBoxToResponse(pantryBox, pantryItems);

  return pantryBoxInfo;
};

const getPantryBoxInfo = async (pantryBoxId: number) => {
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
      WHERE box.id = ?`,
    [pantryBoxId]
  );

  if (!pantryBoxes.length) {
    throw new ServiceError(400, "Pantry box not found");
  }
  return pantryBoxes[0];
};

export const getOriginalPantryBox = async (pantryBoxId: number) => {
  const [pantryBox] = await mysqlDB.execute<PantryBoxOriginalData[]>(
    `SELECT * FROM pantry_boxes WHERE id = ?;`,
    [pantryBoxId]
  );

  if (!pantryBox.length) {
    throw new ServiceError(400, "Pantry box not found");
  }

  return pantryBox[0];
};
