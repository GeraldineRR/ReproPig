import db from "../database/db.js";
import { DataTypes } from "sequelize";

const TipoActividadModel = db.define('tipos_actividad', {
    Id_Tipo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Activo'
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default TipoActividadModel;
