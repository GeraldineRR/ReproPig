import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize(
  process.env.DB_NAME || "repropig",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false,
  }
);

export default db;