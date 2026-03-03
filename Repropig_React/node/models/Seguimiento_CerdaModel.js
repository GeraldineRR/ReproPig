import db from "../database/db.js";
import { DataTypes } from "sequelize";

const Seguimiento_CerdaModel = db.define('Seguimiento_Cerda', {

    Id_Seguimiento_Cerda: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    Fecha: { type: DataTypes.DATE },
    Hora: { type: DataTypes.TIME },
    Observaciones: { type: DataTypes.STRING },
    Id_Porcino: { type: DataTypes.INTEGER },
    Id_Responsable: { type: DataTypes.INTEGER },
},{
    freezeTableName: true,
})

export default Seguimiento_CerdaModel;