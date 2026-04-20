import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const inseminacionModel = db.define('inseminacion', {
    Id_Inseminacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Fec_hora: { type: DataTypes.DATE },
    Id_Porcino: { type: DataTypes.INTEGER },
    cantidad: { type: DataTypes.INTEGER },
    Id_Responsable: { type: DataTypes.STRING },
    Id_colecta: { type: DataTypes.INTEGER},
    Observaciones: { type: DataTypes.STRING },
    Id_Reproduccion: { type: DataTypes.INTEGER },
}, {
    freezeTableName: true
})
export default inseminacionModel;