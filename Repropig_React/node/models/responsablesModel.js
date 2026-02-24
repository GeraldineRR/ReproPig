import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const ResponsablesModel = db.define('responsable', {
    Id_Responsable: { type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true },
    Nombres: { type: DataTypes.STRING },
    Apellidos: { type: DataTypes.STRING },
    Documento: { type: DataTypes.STRING },
    Cargo: { type: DataTypes.ENUM('Gestor', 'Instructor', 'Pasante') },
    Telefono: { type: DataTypes.NUMBER },
    Email: { type: DataTypes.STRING },
    Estado: { type: DataTypes.ENUM('Activo', 'Inactivo') }    
}, {
    freezeTableName: true,
})

export default ResponsablesModel;