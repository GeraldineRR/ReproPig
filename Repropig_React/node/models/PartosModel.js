import db from "../database/db.js";
import { DataTypes } from "sequelize";

const PartosModel = db.define("partos",{
    Id_Parto: { type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true},
    Id_Reproducciones: { type: DataTypes.NUMBER},
    frp: { type: DataTypes.STRING},
    Hora_Inicial: {type:DataTypes.DATE},
    Hora_Final: {type:DataTypes.DATE},
    
}, {
    freezeTableName: true
})

export default PartosModel;