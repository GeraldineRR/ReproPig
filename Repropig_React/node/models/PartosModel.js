import db from "../database/db.js"
import { DataTypes } from "sequelize"

const PartosModel = db.define("partos", {

  Id_parto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  Id_Porcino: {
    type: DataTypes.INTEGER,
  },

  Fec_inicio: {
    type: DataTypes.DATE,
  },
  Hor_inicial: {
    type: DataTypes.TIME,
  },

  Nac_vivos: {
    type: DataTypes.INTEGER,
  },

  Nac_momias: {
    type: DataTypes.INTEGER,
  },

  Nac_muertos: {
    type: DataTypes.INTEGER,
  },

  Pes_camada: {
    type: DataTypes.DECIMAL(10, 0),
  },

  Observaciones: {
    type: DataTypes.CHAR(255),
  },

  Fec_fin: {
    type: DataTypes.DATE,
  },

  Hor_final: {
    type: DataTypes.TIME,
  },
  estado: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    defaultValue: "Activo",
  }

}, {
  freezeTableName: true,
})
export default PartosModel
