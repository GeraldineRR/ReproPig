import db from "../database/db.js";
import { DataTypes } from "sequelize";

const RazaModel = db.define('razas', {

    Id_Raza: {type:DataTypes.NUMBER, primaryKey: true, autoIncrement: true},
    Nom_Raza: { type: DataTypes.STRING },
},{
    freezeTableName: true,
})

export default RazaModel;