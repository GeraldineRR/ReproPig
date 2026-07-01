import db from './database/db.js';
import RazaModel from './models/razaModel.js';
import ResponsablesModel from './models/responsablesModel.js';
import MedicamentosModel from './models/MedicamentosModel.js';
import PorcinoModel from './models/porcinoModel.js';
import CiclosModel from './models/ciclosModel.js';
import ColectaModel from './models/colectaModel.js';
import MontaModel from './models/montaModel.js';
import InseminacionModel from './models/inseminacionModel.js';
import CalendarioModel from './models/CalendarioModel.js';
import PartosModel from './models/PartosModel.js';
import CriaModel from './models/criaModel.js';
import Seguimiento_CerdaModel from './models/Seguimiento_CerdaModel.js';
import ActividadesCamadaModel from './models/actividadesCamadaModel.js';
import SegcamadaModel from './models/segcamadaModel.js';
import NovedadesModel from './models/novedadesModel.js';

async function seedAll() {
  try {
    await db.authenticate();
    console.log('DB connection ok — starting seed sequence')

    const safeCreate = async (model, payload, name) => {
      try {
        return await model.create(payload)
      } catch (err) {
        console.warn(`Warning creating ${name || (model.name || (model.getTableName && model.getTableName()) )}:`, err.message)
        return null
      }
    }

    // Parents
    const raza = await safeCreate(RazaModel, { Nom_Raza: 'Large White' }, 'razas')
    const responsable = await safeCreate(ResponsablesModel, { Nombres: 'Admin', Apellidos: 'User', Cargo: 'Instructor' }, 'responsable')
    const medicamento = await safeCreate(MedicamentosModel, { Nombre: 'VacunaX', Tipo: 'Vacuna', Presentacion: 'Ampolla', Observaciones: 'Seed med' }, 'medicamentos')

    // Porcinos (cerda + cerdo)
    const cerda = await safeCreate(PorcinoModel, { Nom_Porcino: 'Cerda 1', Num_Chapeta: 1001, Id_Raza: raza && (raza.Id_Raza || raza.Id_Raza), Gen_Porcino: 'H', Fec_Nac_Porcino: new Date() }, 'porcinos')
    const cerdo = await safeCreate(PorcinoModel, { Nom_Porcino: 'Cerdo 1', Num_Chapeta: 2001, Id_Raza: raza && (raza.Id_Raza || raza.Id_Raza), Gen_Porcino: 'M', Fec_Nac_Porcino: new Date() }, 'porcinos')

    // Ciclo
    const ciclo = await safeCreate(CiclosModel, { Id_Cerda: cerda && (cerda.Id_Porcino || cerda.Id_Porcino), TipoCiclo: 'Monta', activo: 'S' }, 'ciclo')

    // Colecta + Inseminacion
    const colecta = await safeCreate(ColectaModel, { Fecha: new Date(), Uso_colecta: 'No', Tipo: 'Interno', Id_Porcino: cerdo && (cerdo.Id_Porcino || cerdo.Id_Porcino), Id_Responsable: responsable && (responsable.Id_Responsable || responsable.Id_Responsable), volumen: 10.5, color: 'blanco', olor: 'normal', cant_generada: 1, Observaciones: 'Seed' }, 'colecta')
    const inseminacion = await safeCreate(InseminacionModel, { Fec_hora: new Date(), Id_Porcino: cerda && cerda.Id_Porcino, cantidad: 1, Id_Responsable: responsable && responsable.Id_Responsable, Id_colecta: colecta && colecta.Id_colecta, Observaciones: 'Seed insem', Id_Ciclo: ciclo && ciclo.Id_Ciclo }, 'inseminacion')

    // Monta
    const monta = await safeCreate(MontaModel, { Fec_hora: new Date(), Id_Porcino: cerda && cerda.Id_Porcino, Id_Cerdo: cerdo && cerdo.Id_Porcino, Id_Responsable: responsable && responsable.Id_Responsable, Observaciones: 'Seed monta', Id_Ciclo: ciclo && ciclo.Id_Ciclo }, 'monta')

    // Calendario
    const calendario = await safeCreate(CalendarioModel, { Id_Ciclo: ciclo && ciclo.Id_Ciclo, Fecha_Servicio: new Date() }, 'Calendario')

    // Parto + crias
    const parto = await safeCreate(PartosModel, { Id_Porcino: cerda && cerda.Id_Porcino, Fec_inicio: new Date(), Nac_vivos: 8, Pes_camada: 250, estado: 'Activo', Id_Ciclo: ciclo && ciclo.Id_Ciclo }, 'partos')
    const cria1 = await safeCreate(CriaModel, { Id_parto: parto && parto.Id_parto, Num_Cria: 1, Sexo: 'H', Estado: 'Vivo' }, 'crias')
    const cria2 = await safeCreate(CriaModel, { Id_parto: parto && parto.Id_parto, Num_Cria: 2, Sexo: 'M', Estado: 'Vivo' }, 'crias')

    // Seguimiento y actividades
    const seg = await safeCreate(Seguimiento_CerdaModel, { Fecha: new Date(), Hora: '09:00', Observaciones: 'OK', Id_Porcino: cerda && cerda.Id_Porcino, Id_Responsable: responsable && responsable.Id_Responsable, Id_Medicamento: medicamento && medicamento.Id_Medicamento, Id_Ciclo: ciclo && ciclo.Id_Ciclo }, 'Seguimiento_Cerda')
    await safeCreate(ActividadesCamadaModel, { Tipo_Actividad: 'Pesaje', Fecha_Actividad: new Date(), Observaciones: 'Seed actividad', Id_Medicamento: medicamento && medicamento.Id_Medicamento, Id_Parto: parto && parto.Id_parto, Id_Porcino: cerda && cerda.Id_Porcino }, 'actividades_camada')
    await safeCreate(SegcamadaModel, { Id_Cria: cria1 && cria1.Id_Cria, Dia_Programado: 7, Fecha_Real: new Date(), Peso_Cria: 1.2 }, 'segcamada')

    // Novedad
    await safeCreate(NovedadesModel, { Tipo_Novedad: 'Info', Fecha_Novedad: new Date(), Causa_Motivo: 'Seed', Observaciones: 'Automated seed', Id_Porcino: cerda && cerda.Id_Porcino }, 'novedades')

    console.log('Seeding complete.')
    process.exit(0)
  } catch (err) {
    console.error('Error during seed:', err.message)
    process.exit(1)
  }
}

seedAll();
