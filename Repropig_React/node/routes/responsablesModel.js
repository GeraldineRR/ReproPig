import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const resposablesmodel = db.define('resposables', {
    id_resposable: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nombre: { type: DataTypes.STRING },
    Apellido: { type: DataTypes.STRING },
    Documento: { type: DataTypes.STRING },
    Cargo: { type: DataTypes.STRING },
    Telefono: { type: DataTypes.STRING },
    Correo: { type: DataTypes.STRING },
}, {
    freezeTableName: true,
})

export default resposablesmodel;