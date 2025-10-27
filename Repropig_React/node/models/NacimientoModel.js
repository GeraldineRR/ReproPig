import db from "../database/db.js";
import { DataTypes } from "sequelize";

const NacimientoModel = db.define("players",{
    Id_Nacimiento:{ type:DataTypes.NUMBER},
    Nac_Vivos: { type: DataTypes.NUMBER},
    Nac_Muertos: {type: DataTypes.NUMBER},
    Sacrificados: {type:DataTypes.NUMBER},
    Aplastados: {type:DataTypes.NUMBER},
    Can_Hembras: {type:DataTypes.NUMBER},
    Can_Machos: {type:DataTypes.NUMBER},
    Id_Parto: {type:DataTypes.NUMBER}
},{
    freezeTableName: true
})
export default NacimientoModel;