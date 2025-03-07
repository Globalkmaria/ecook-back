import { RowDataPacket } from "mysql2";

export interface PantryBoxInfoServerData extends RowDataPacket {
  img: string;
  ingredient_name: string;
  product_name: string | null;
}

export interface PantryBoxOriginalData extends RowDataPacket {
  id: number;
  ingredient_id: number;
  product_id: number | null;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}
