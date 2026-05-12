import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const reproduccionesModel = db.define('reproduccion', {
    Id_Reproduccion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Cerda: { type: DataTypes.INTEGER, allowNull: false },
    activo: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'S',
        field: 'Activo'
    },
    TipoReproduccion: { type: DataTypes.STRING(20), allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: 'createdat',
    updatedAt: 'updatedat',
});
export default reproduccionesModel;