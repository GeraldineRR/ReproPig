import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const montaModel = db.define('monta', {
    Id_Monta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Fec_hora: { type: DataTypes.DATE },
    Id_Porcino: { type: DataTypes.STRING },
    Id_Responsables: { type: DataTypes.STRING },
    Observaciones: { type: DataTypes.STRING },
    Id_Reproduccion: { type: DataTypes.STRING },
}, {
    freezeTableName: true
})
export default montaModel;