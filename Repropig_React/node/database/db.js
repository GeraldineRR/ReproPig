import { Sequelize } from "sequelize";

const db = new Sequelize("repropig", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default db;