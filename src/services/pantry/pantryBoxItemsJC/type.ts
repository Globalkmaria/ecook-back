import { RowDataPacket } from "mysql2";

export interface PantryBoxItemLink extends RowDataPacket {
  pantry_item_id: number;
  pantry_box_id: number;
}
