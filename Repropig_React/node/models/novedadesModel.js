import db from "../database/db.js";
import { DataTypes } from "sequelize";

const NovedadesModel = db.define('novedades', {
    Id_Novedad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Tipo_Novedad: { type: DataTypes.STRING, allowNull: false },
    Fecha_Novedad: { type: DataTypes.DATEONLY, allowNull: false },
    Causa_Motivo: { type: DataTypes.STRING, allowNull: true },
    Observaciones: { type: DataTypes.TEXT, allowNull: true },
    Id_Porcino: { type: DataTypes.INTEGER, allowNull: false }
}, {
    freezeTableName: true,
    timestamps: false
});

export default NovedadesModel;
