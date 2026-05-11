import db from "../database/db.js";
import { DataTypes } from "sequelize";

const CalendarioModel = db.define('Calendario', {

    Id_Calendario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Reproduccion: { type: DataTypes.INTEGER },
    Fecha_Servicio: { type: DataTypes.DATEONLY },

    rc1: { type: DataTypes.DATE },
    rc2: { type: DataTypes.DATE },
    cambio_alimento: { type: DataTypes.DATE },
    dia_107: { type: DataTypes.DATE },
    parto: { type: DataTypes.DATE },

    real_rc1: { type: DataTypes.DATE, allowNull: true },
    real_rc2: { type: DataTypes.DATE, allowNull: true },
    real_cambio_alimento: { type: DataTypes.DATE, allowNull: true },
    real_dia_107: { type: DataTypes.DATE, allowNull: true },
    real_parto: { type: DataTypes.DATE, allowNull: true },

}, {
    freezeTableName: true,
})

export default CalendarioModel;