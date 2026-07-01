import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const ciclosModel = db.define('ciclo', {
    Id_Ciclo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Cerda: { type: DataTypes.INTEGER, allowNull: false },
    activo: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'S',
        field: 'Activo'
    },
    TipoCiclo: { type: DataTypes.STRING(20), allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false
});

export default ciclosModel;