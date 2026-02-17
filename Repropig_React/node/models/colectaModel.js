import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const colectaModel = db.define('colecta', {
    Id_colecta: { type: DataTypes.STRING, primaryKey: true, autoIncrement: true },
    Fecha: { type: DataTypes.DATE },
    Uso_colecta: { type: DataTypes.ENUM('Si', 'No') },
    Tipo: { type: DataTypes.ENUM('Interno', 'Externo') },
    Id_Porcino: { type: DataTypes.STRING },
    Id_Responsables: { type: DataTypes.STRING },
    volumen: { type: DataTypes.DECIMAL(6, 2) },
    color: { type: DataTypes.STRING(50) },
    olor: { type: DataTypes.STRING(50) },
    cant_generada: { type: DataTypes.INTEGER },
    cant_utilizada: { type: DataTypes.INTEGER},
    Observaciones: { type: DataTypes.STRING },

}, {
    freezeTableName: true
})
export default colectaModel;