import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const ResponsablesModel = db.define('responsables', {
    id_responsable: { type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true },
    Nombres: { type: DataTypes.STRING },
    Apellidos: { type: DataTypes.STRING },
    Documento: { type: DataTypes.STRING },
    Cargo: { type: DataTypes.STRING('Gestor', 'Instructor', 'Pasante') },
    Telefono: { type: DataTypes.STRING },
    Correo: { type: DataTypes.STRING },
}, {
    freezeTableName: true,
})

export default ResponsablesModel;