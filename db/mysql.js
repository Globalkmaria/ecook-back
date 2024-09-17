import mysql from "mysql2/promise";
import { config } from "../config/index.js";

const mysqlDB = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  port: config.mysql.port,
});

export default mysqlDB;
