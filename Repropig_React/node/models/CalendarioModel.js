import db from "../database/db.js";
import { DataTypes } from "sequelize";

const CalendarioModel = db.define('Calendario', {

    Id_Calendario:  { type: DataTypes.INTEGER,  primaryKey: true, autoIncrement: true },
    Id_Reproduccion: { type: DataTypes.INTEGER },
    Fecha_Servicio: { type: DataTypes.DATEONLY },

    'proyectado-1rcl': { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    'proyectado-2rcl': { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    'proyectado-3rcl': { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    'proyectado-4rcl': { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    'proyectado-5rcl': { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

    'real-1rcl': { type: DataTypes.DATE, allowNull: true },
    'real-2rcl': { type: DataTypes.DATE, allowNull: true },
    'real-3rcl': { type: DataTypes.DATE, allowNull: true },
    'real-4rcl': { type: DataTypes.DATE, allowNull: true },
    'real-5rcl': { type: DataTypes.DATE, allowNull: true },

}, {
    freezeTableName: true,
})

export default CalendarioModel;