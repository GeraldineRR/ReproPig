import db from "../database/db.js";
import { DataTypes } from "sequelize";

const Seguimiento_CerdaModel = db.define('Seguimiento_Cerda', {

    Id_Seguimiento_Cerda: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_parto: { type: DataTypes.INTEGER, allowNull: false },
    Dia_Programado: { type: DataTypes.INTEGER, allowNull: false },
    Fecha_Real: { type: DataTypes.DATE, allowNull: false },
    Id_Responsable: { type: DataTypes.INTEGER, allowNull: false },
    Id_Medicamento: { type: DataTypes.INTEGER, allowNull: true },
    Observaciones: { type: DataTypes.STRING(255), allowNull: true },
}, {
    freezeTableName: true,
})

export default Seguimiento_CerdaModel;