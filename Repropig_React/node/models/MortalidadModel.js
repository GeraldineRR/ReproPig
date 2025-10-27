import db from "../database/db.js";
import { DataTypes } from "sequelize";

const MortalidadModel = db.define("mortalidad",{
    Id_Mortalidad: { type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true},
    Id_Porcino: { type: DataTypes.NUMBER},
    Tip_Mortalidad: { type: DataTypes.STRING},
    Sacrificado: {type: DataTypes.STRING},
    Fecha: {type:DataTypes.DATE},
    Hora: {type:DataTypes.DATE},
    Id_Responsable: {type:DataTypes.NUMBER},
}, {
    freezeTableName: true
})

export default MortalidadModel;