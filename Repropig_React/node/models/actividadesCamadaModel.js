import db from "../database/db.js";
import { DataTypes } from "sequelize";

const ActividadesCamadaModel = db.define('actividades_camada', {
    Id_Actividad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Tipo_Actividad: { type: DataTypes.STRING, allowNull: false },
    Fecha_Actividad: { type: DataTypes.DATEONLY, allowNull: false },
    Observaciones: { type: DataTypes.TEXT, allowNull: true },
    Id_Medicamento: { type: DataTypes.INTEGER, allowNull: true },
    Id_Parto: { type: DataTypes.INTEGER, allowNull: true },
    Id_Porcino: { type: DataTypes.INTEGER, allowNull: true }
}, {
    freezeTableName: true,
    timestamps: false
});

export default ActividadesCamadaModel;
