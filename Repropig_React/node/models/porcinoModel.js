import db from "../database/db.js";
import { DataTypes } from "sequelize";

const PorcinoModel = db.define('porcinos', {

    Id_Porcino: {type:DataTypes.NUMBER, primaryKey: true, autoIncrement: true},
    Num_Chapeta: { type: DataTypes.INTEGER },
    Nom_Porcino: { type: DataTypes.STRING },
    Fec_Nac_Porcino: { type: DataTypes.DATE },
    Genero_Porcino: { type: DataTypes.CHAR },
    Cant_Pez_Porcino: { type: DataTypes.INTEGER, allowNull: true },
    Origen_Porcino: { type: DataTypes.STRING, allowNull: true },
    Id_Raza: { type: DataTypes.NUMBER },
    Id_Porcino_Madre: { type: DataTypes.INTEGER, allowNull: true },
    Id_Porcino_MachoRep: { type: DataTypes.INTEGER, allowNull: true },
},{
    freezeTableName: true,
})

export default PorcinoModel;