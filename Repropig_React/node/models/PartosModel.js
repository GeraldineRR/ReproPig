// ============================
// IMPORTACIÓN DE DEPENDENCIAS
// ============================

// Conexión a la base de datos configurada con Sequelize
import db from "../database/db.js"

// Tipos de datos que ofrece Sequelize
import { DataTypes } from "sequelize"


// ============================
// DEFINICIÓN DEL MODELO PARTOS
// ============================

// Se define el modelo "partos", que representa la tabla en la base de datos
const PartosModel = db.define("partos", {

  // ============================
  // CLAVE PRIMARIA
  // ============================

  // ID único del parto
  Id_parto: {
    type: DataTypes.INTEGER,   // Tipo entero
    primaryKey: true,          // Clave primaria
    autoIncrement: true,       // Se incrementa automáticamente
  },


  // ============================
  // RELACIÓN CON PORCINO
  // ============================

  // ID del porcino asociado al parto
  Id_Porcino: {
    type: DataTypes.INTEGER,   // Tipo entero (relación)
  },


  // ============================
  // FECHA Y HORA DE INICIO
  // ============================

  // Fecha en que inicia el parto
  Fec_inicio: {
    type: DataTypes.DATE,      // Tipo fecha
  },

  // Hora en que inicia el parto
  Hor_inicial: {
    type: DataTypes.TIME,      // Tipo hora
  },


  // ============================
  // DATOS DE NACIMIENTOS
  // ============================

  // Cantidad de lechones nacidos vivos
  Nac_vivos: {
    type: DataTypes.INTEGER,
  },

  // Cantidad de lechones momificados
  Nac_momias: {
    type: DataTypes.INTEGER,
  },

  // Cantidad de lechones nacidos muertos
  Nac_muertos: {
    type: DataTypes.INTEGER,
  },


  // ============================
  // PESO DE LA CAMADA
  // ============================

  // Peso total de la camada
  Pes_camada: {
    type: DataTypes.DECIMAL(10, 0), // Número decimal
  },


  // ============================
  // OBSERVACIONES
  // ============================

  // Comentarios adicionales del parto
  Observaciones: {
    type: DataTypes.CHAR(255), // Texto fijo de hasta 255 caracteres
  },


  // ============================
  // FECHA Y HORA DE FINALIZACIÓN
  // ============================

  // Fecha en que finaliza el parto
  Fec_fin: {
    type: DataTypes.DATE,
  },

  // Hora en que finaliza el parto
  Hor_final: {
    type: DataTypes.TIME,
  },




}, {

  // ============================
  // CONFIGURACIÓN DEL MODELO
  // ============================

  // Evita que Sequelize cambie el nombre de la tabla (no pluraliza)
  freezeTableName: true,
})


// ============================
// EXPORTACIÓN
// ============================

// Se exporta el modelo para usarlo en servicios, controladores y rutas
export default PartosModel