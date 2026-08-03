import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const montaModel = db.define('monta', {
    Id_Monta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Fec_hora: { type: DataTypes.DATE },
    Id_Porcino: { type: DataTypes.INTEGER },
    Id_Cerdo: { type: DataTypes.INTEGER },
    Id_Responsable: { type: DataTypes.TEXT },
    Observaciones: { type: DataTypes.STRING },
    Id_Ciclo: { type: DataTypes.INTEGER },
}, {
    freezeTableName: true,
    timestamps: false
})
export default montaModel;