import { Sequelize } from "sequelize";

const db = new Sequelize("repropig", "root", "1234", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});

export default db;