import { RowDataPacket } from "mysql2";

export interface PantryItemServerData extends RowDataPacket {
  id: number;
  user_id: number;
  quantity: number;
  buy_date: Date;
  expire_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GetPantryItemsByUserIdRes extends PantryItemServerData {
  pantry_box_id: number;
}
