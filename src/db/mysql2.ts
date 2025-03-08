import mysql from "mysql2/promise";

import { config } from "../config/index";

const mysqlDB2 = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database2,
  port: Number(config.mysql.port),
});

export default mysqlDB2;
