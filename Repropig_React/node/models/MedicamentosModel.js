import db from "../database/db.js"
import { DataTypes } from "sequelize"

const MedicamentosModel = db.define( "medicamentos", {

    Id_Medicamento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    Nombre: { type: DataTypes.STRING, allowNull: false},
    Tipo: { type: DataTypes.ENUM('Vacuna','Vitamina','Antibiotico','Analgesico','Antiparasitario','Antiinflamatorio'), allowNull: false},
    Presentacion: { type: DataTypes.STRING,allowNull: false},
    Observaciones: { type: DataTypes.TEXT }
  },{
    freezeTableName: true,
    timestamps: false
  })

export default MedicamentosModel
