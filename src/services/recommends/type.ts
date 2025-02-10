import { RowDataPacket } from "mysql2";

export interface Recommend extends RowDataPacket {
  id: number;
  page: string;
  type: string;
  value: string;
  label: string;
}
