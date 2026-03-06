import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const reproduccionesModel = db.define('reproduccion', {
    Id_Reproduccion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Cerda: { type: DataTypes.INTEGER, allowNull: false },
    Activo: { type: DataTypes.STRING(2), allowNull: false },
    TipoReproduccion: { type: DataTypes.STRING(20), allowNull: true }, // Monta o Inseminacion
}, {
    freezeTableName: true,
    timestamps: false
});

export default reproduccionesModel;