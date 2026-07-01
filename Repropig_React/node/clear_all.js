import db from './database/db.js';
import RazaModel from './models/razaModel.js';
import ResponsablesModel from './models/responsablesModel.js';
import MedicamentosModel from './models/MedicamentosModel.js';
import SegcamadaModel from './models/segcamadaModel.js';
import ActividadesCamadaModel from './models/actividadesCamadaModel.js';
import Seguimiento_CerdaModel from './models/Seguimiento_CerdaModel.js';
import InseminacionModel from './models/inseminacionModel.js';
import MontaModel from './models/montaModel.js';
import CriaModel from './models/criaModel.js';
import PartosModel from './models/PartosModel.js';
import ColectaModel from './models/colectaModel.js';
import CalendarioModel from './models/CalendarioModel.js';
import CiclosModel from './models/ciclosModel.js';
import PorcinoModel from './models/porcinoModel.js';
import NovedadesModel from './models/novedadesModel.js';

// Note: we intentionally skip truncating the `responsable` table
// to preserve existing users (e.g. "juanka").
const modelsInOrder = [
  SegcamadaModel,
  ActividadesCamadaModel,
  Seguimiento_CerdaModel,
  InseminacionModel,
  MontaModel,
  CriaModel,
  PartosModel,
  ColectaModel,
  CalendarioModel,
  CiclosModel,
  NovedadesModel,
  PorcinoModel,
  MedicamentosModel,
  RazaModel,
];

async function clearAll() {
  try {
    await db.authenticate();
    console.log('DB connection ok — starting clear sequence')

    for (const model of modelsInOrder) {
      const name = model.getTableName ? model.getTableName() : model.name || 'unknown'
      console.log('Clearing', name)
      try {
        await model.destroy({ where: {}, truncate: true, force: true })
      } catch (err) {
        console.warn(`Warning clearing ${name}:`, err.message)
        // continue with next model
      }
    }

    console.log('All tables cleared (truncate).')
    process.exit(0)
  } catch (err) {
    console.error('Error during clear:', err.message)
    process.exit(1)
  }
}

clearAll();
