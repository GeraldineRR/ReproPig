import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const reproduccionesModel = db.define('reproduccion', {
    Id_Reproduccion: { type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true },
    Id_Cerda: { type: DataTypes.NUMBER }, 
    Activo: { type:DataTypes.TEXT},
}, {
    freezeTableName: true
})
export default reproduccionesModel;