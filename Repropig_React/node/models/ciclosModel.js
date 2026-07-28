import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const ciclosModel = db.define('ciclos_reproductivos', {
    Id_Ciclo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Cerda: { type: DataTypes.INTEGER, allowNull: false },
    Estado: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        defaultValue: 'Activo',
        field: 'Estado'
    },
    TipoCiclo: { type: DataTypes.STRING(20), allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false
});

export default ciclosModel;