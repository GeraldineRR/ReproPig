import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const ResponsablesModel = db.define('responsable', {
    Id_Responsable: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nombres: { type: DataTypes.STRING },
    Apellidos: { type: DataTypes.STRING },
    Documento: { type: DataTypes.STRING },
    Cargo: { type: DataTypes.ENUM('Gestor', 'Instructor', 'Pasante') },
    Telefono: { type: DataTypes.STRING},
    Email: { type: DataTypes.STRING },
    Password: { type: DataTypes.STRING }, // ✅ campo contraseña
    Estado: { type: DataTypes.ENUM('Activo', 'Inactivo') }
}, {
    freezeTableName: true,
})

export default ResponsablesModel;