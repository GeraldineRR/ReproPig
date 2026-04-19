import db from "../database/db.js";
import { DataTypes } from "sequelize";

const SegcamadaModel = db.define ('segcamada', {

    Id_SegCamada: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Cria: { type: DataTypes.INTEGER, allowNull: false },
    Dia_Programado: { type: DataTypes.INTEGER, allowNull: false },
    Fecha_Real: { type: DataTypes.DATE, allowNull: false },
    Peso_Cria: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    Id_Medicamento: { type: DataTypes.INTEGER, allowNull: true },
    Observaciones: { type: DataTypes.CHAR(255), allowNull: true },
}, {
    freezeTableName: true,
});

export default SegcamadaModel;