import { RowDataPacket } from "mysql2";

import mysqlDB from "../../db/mysql.js";

export const checkUsernameExists = async (
  username: string
): Promise<boolean> => {
  const [result] = await mysqlDB.execute<RowDataPacket[]>(
    "SELECT 1 FROM users WHERE username = ? LIMIT 1",
    [username]
  );

  return result.length === 0;
};
