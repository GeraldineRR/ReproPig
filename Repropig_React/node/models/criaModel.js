import db from "../database/db.js";
import { DataTypes } from "sequelize";

const CriaModel = db.define('crias', {

    Id_Cria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_parto: { type: DataTypes.INTEGER, allowNull: false},
    Num_Cria: { type: DataTypes.INTEGER, allowNull: true},
    Sexo: { type: DataTypes.CHAR(1), allowNull: false},
    Estado: { type: DataTypes.ENUM('Vivo', 'Muerto'), allowNull: false},
    Causa_Muerte: { type: DataTypes.CHAR(50), allowNull: true },
    Fecha_Muerte: { type: DataTypes.DATE, allowNull: true },
}, {
    freezeTableName: true,
});

export default CriaModel;