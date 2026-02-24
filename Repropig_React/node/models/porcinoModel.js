import db from "../database/db.js";
import { DataTypes } from "sequelize";

const PorcinoModel = db.define('porcinos', {

    Id_Porcino: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    Foto_Porcino: { type: DataTypes.STRING, allowNull: true },

    Nom_Porcino: { type: DataTypes.STRING, allowNull: false },

    Num_Chapeta: { type: DataTypes.INTEGER, allowNull: false },

    Plac_Sena_Porcino: { type: DataTypes.INTEGER, allowNull: true },

    Id_Raza: { type: DataTypes.INTEGER, allowNull: false },

    Genero_Porcino: { type: DataTypes.CHAR(1), allowNull: false },

    Proc_Porcino: { type: DataTypes.CHAR(1), allowNull: true },

    Lug_Proc_Porcino: { type: DataTypes.STRING, allowNull: true },

    Origen_Porcino: { type: DataTypes.STRING, allowNull: true },

    Fec_Nac_Porcino: { type: DataTypes.DATE, allowNull: false },

    Fec_Llegada: { type: DataTypes.DATE, allowNull: true },

    Peso_Llegada: { type: DataTypes.DECIMAL(10,2), allowNull: true },

    Edad_Llegada: { type: DataTypes.INTEGER, allowNull: true },

    Cant_Pez_Porcino: { type: DataTypes.INTEGER, allowNull: true },

    Id_Porcino_Madre: { type: DataTypes.INTEGER, allowNull: true },

    Id_Porcino_MachoRep: { type: DataTypes.INTEGER, allowNull: true },

}, {
    freezeTableName: true,
});

export default PorcinoModel;