import db from "../database/db.js"
import { DataTypes } from "sequelize"

const PartosModel = db.define("partos", {

  Id_parto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "Id_parto"
  },

  Id_Porcino: {
    type: DataTypes.INTEGER,
    field: "Id_Porcino"
  },

  Fec_inicio: {
    type: DataTypes.DATE,
    field: "Fec_inicio"
  },
   Hor_inicial: {
    type: DataTypes.TIME,
    field: "Hor_inicial"
  },

  Nac_vivos: {
    type: DataTypes.INTEGER,
    field: "Nac_vivos"
  },

  Nac_momias: {
    type: DataTypes.INTEGER,
    field: "Nac_momias"
  },

  Nac_muertos: {
    type: DataTypes.INTEGER,
    field: "Nac_muertos"
  },

  Pes_camada: {
    type: DataTypes.DECIMAL(10,0),
    field: "Pes_camada"
  },

  Observaciones: {
    type: DataTypes.TEXT,
    field: "Observaciones"
  },

  Fec_fin: {
    type: DataTypes.DATE,
    field: "Fec_fin"
  },
   Hor_final: {
    type: DataTypes.TIME,
    field: "Hor_final"
  }

}, {
  freezeTableName: true,
  timestamps: false
})
export default PartosModel
