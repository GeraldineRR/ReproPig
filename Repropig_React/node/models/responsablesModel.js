import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const resposablesmodel = db.define('responsables', {
    id_responsable: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nombres: { type: DataTypes.STRING },
    Apellidos: { type: DataTypes.STRING },
    Documento: { type: DataTypes.NUMBER },
    Cargo: { type: DataTypes.NUMBER },
    Telefono: { type: DataTypes.NUMBER },
    Correo: { type: DataTypes.STRING },
}, {
    freezeTableName: true,
})

export default resposablesmodel;