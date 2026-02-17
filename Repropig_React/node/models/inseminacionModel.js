import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const inseminacionModel = db.define('inseminacion', {
    Id_inseminacion: { type: DataTypes.STRING, primaryKey: true, autoIncrement: true },
    Fec_hora: { type: DataTypes.DATE },
    Id_Porcino: { type: DataTypes.STRING },
    cantidad: { type: DataTypes.DECIMAL(6, 2) },
    Id_Responsables: { type: DataTypes.STRING },
    Id_colecta: { type: DataTypes.STRING },
    Observaciones: { type: DataTypes.STRING },
    Id_Reproduccion: { type: DataTypes.STRING },
}, {
    freezeTableName: true
})
export default inseminacionModel;