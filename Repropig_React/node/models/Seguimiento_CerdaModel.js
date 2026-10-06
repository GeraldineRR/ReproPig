import db from "../database/db.js";
import { DataTypes } from "sequelize";

const Seguimiento_CerdaModel = db.define(
    "Seguimiento_Cerda",
    {
        Id_Seguimiento_Cerda: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        Fecha: {
            type: DataTypes.DATE,
            allowNull: true
        },

        Hora: {
            type: DataTypes.TIME,
            allowNull: true
        },

        Observaciones: {
            type: DataTypes.STRING,
            allowNull: true
        },

        Id_Porcino: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        Id_Responsable: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        Id_Medicamento: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        Id_Ciclo: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        Estado: {
            type: DataTypes.STRING,
            defaultValue: "Activo"
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Seguimiento_CerdaModel;