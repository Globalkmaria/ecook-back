import { RowDataPacket } from "mysql2";

export interface PantryBoxInfoServerData extends RowDataPacket {
  img: string;
  ingredient_name: string;
  product_name: string | null;
}
