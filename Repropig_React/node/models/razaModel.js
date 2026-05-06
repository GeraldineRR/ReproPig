import db from "../database/db.js";
import { DataTypes } from "sequelize";

const RazaModel = db.define('razas', {

    Id_Raza: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    Nom_Raza: { type: DataTypes.STRING },
    Estado: { type: DataTypes.CHAR(10), defaultValue: "Activo", allowNull: false},
},{
    freezeTableName: true,
})

export default RazaModel;