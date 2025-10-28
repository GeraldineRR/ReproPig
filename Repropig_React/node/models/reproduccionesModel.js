import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const reproduccionesModel = db.define('reproducciones', {
    Id_Reproduccion: { type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true },
    Id_Porcino: { type: DataTypes.NUMBER }, 
    Id_Porcino_MachoRep: { type: DataTypes.NUMBER },
    Fecha_servicio: { type: DataTypes.DATE },
    Tipo_Servicio: { type: DataTypes.ENUM('Monta', 'Inseminacion') },
    Resultado: { type: DataTypes.ENUM('pendiente', '1RC','2RC','preñada','vacia') },
}, {
    freezeTableName: true
})
export default reproduccionesModel;