import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize(
  process.env.DB_NAME || "repropig",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    dialect: "mysql",

    logging: process.env.NODE_ENV === "development" ? false : false,
    timezone: "-05:00", // Hora legal de Colombia (Espinal, Tolima)
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || "30", 10),
      min: parseInt(process.env.DB_POOL_MIN || "5", 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000", 10),
      idle: parseInt(process.env.DB_POOL_IDLE || "10000", 10),
      evict: 5000,
    },
    dialectOptions: {
      connectTimeout: 30000,
      decimalNumbers: true,
    },
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /ECONNRESET/,
        /PROTOCOL_CONNECTION_LOST/
      ]
    }

  }
);

export default db;