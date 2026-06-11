import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const ResponsablesModel = db.define('responsable', {
    Id_Responsable: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nombres: { type: DataTypes.STRING },
    Apellidos: { type: DataTypes.STRING },
    Documento: { type: DataTypes.STRING },
    Cargo: { type: DataTypes.ENUM('Gestor', 'Instructor', 'Pasante') },
    Telefono: { type: DataTypes.STRING },
    Email: { type: DataTypes.STRING },
    Password: { type: DataTypes.STRING },
    Estado: { type: DataTypes.ENUM('Activo', 'Inactivo') },

    // ─── Recuperación de contraseña ───────────────────────────────
    ResetPasswordToken: { type: DataTypes.STRING, allowNull: true },
    ResetPasswordExpires: { type: DataTypes.DATE, allowNull: true }
    // ─────────────────────────────────────────────────────────────

}, {
    freezeTableName: true,
})

export default ResponsablesModel;