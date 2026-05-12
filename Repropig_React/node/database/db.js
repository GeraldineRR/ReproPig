import { Sequelize } from "sequelize";
import dotenv from "dotenv";

const db = new Sequelize("repropig", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default db;