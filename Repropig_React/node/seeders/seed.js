import db from '../database/db.js'
import bcrypt from 'bcryptjs'

// MODELOS
import Raza from '../models/razaModel.js'
import Porcino from '../models/porcinoModel.js'
import Responsable from '../models/responsablesModel.js'
import Reproduccion from '../models/reproduccionesModel.js'
import Monta from '../models/montaModel.js'
import Inseminacion from '../models/inseminacionModel.js'
import Colecta from '../models/colectaModel.js'
import Medicamento from '../models/MedicamentosModel.js'
import Parto from '../models/PartosModel.js'

const seed = async () => {
  try {
    // 🔥 REINICIAR DB
    await db.sync({ force: true })
    console.log('🔥 DB reiniciada')

    // 🔐 HASH CONTRASEÑAS
    const pass1234 = await bcrypt.hash('1234', 10)
    const passKamilo = await bcrypt.hash('Kamilo12', 10)

    // ===== RAZAS =====
    const razas = await Raza.bulkCreate([
      { Nom_Raza: 'Landrace' },
      { Nom_Raza: 'Yorkshire' },
      { Nom_Raza: 'Duroc' }
    ])

    // ===== RESPONSABLES =====
    const responsables = await Responsable.bulkCreate([
      {
        Nombres: 'Juan',
        Apellidos: 'Perez',
        Documento: '123',
        Cargo: 'Gestor',
        Telefono: '300123456',
        Email: 'juan@test.com',
        Password: pass1234,
        Estado: 'Activo'
      },
      {
        Nombres: 'Maria',
        Apellidos: 'Lopez',
        Documento: '456',
        Cargo: 'Instructor',
        Telefono: '300987654',
        Email: 'maria@test.com',
        Password: pass1234,
        Estado: 'Activo'
      },
      {
        Nombres: 'Juan Kamilo',
        Apellidos: 'Morales',
        Documento: '999999',
        Cargo: 'Instructor',
        Telefono: '3001234567',
        Email: 'juanka@gmail.com',
        Password: passKamilo,
        Estado: 'Activo'
      }
    ])

    // ===== PORCINOS =====
    const porcinos = await Porcino.bulkCreate([
      {
        Nom_Porcino: 'Cerdo1',
        Num_Chapeta: 101,
        Plac_Sena_Porcino: 111,
        Id_Raza: razas[0].Id_Raza,
        Gen_Porcino: 'M',
        Proc_Porcino: 'Interno',
        Lug_Proc_Porcino: 'Granja A',
        Fec_Nac_Porcino: new Date('2024-01-01')
      },
      {
        Nom_Porcino: 'Cerda1',
        Num_Chapeta: 102,
        Plac_Sena_Porcino: 112,
        Id_Raza: razas[1].Id_Raza,
        Gen_Porcino: 'H',
        Proc_Porcino: 'Externo',
        Lug_Proc_Porcino: 'Granja B',
        Fec_Nac_Porcino: new Date('2024-02-01')
      }
    ])

    // ===== REPRODUCCIÓN =====
    const reproduccion = await Reproduccion.create({
      Id_Cerda: porcinos[1].Id_Porcino,
      Activo: 'Si',
      TipoReproduccion: 'Monta'
    })

    // ===== MONTA =====
    await Monta.create({
      Fec_hora: new Date(),
      Id_Porcino: porcinos[1].Id_Porcino,
      Id_Cerdo: porcinos[0].Id_Porcino,
      Id_Responsable: responsables[1].Id_Responsable,
      Observaciones: 'Monta de prueba',
      Id_Reproduccion: reproduccion.Id_Reproduccion
    })

    // ===== COLECTA =====
    const colecta = await Colecta.create({
      Fecha: new Date(),
      Uso_colecta: 'Si',
      Tipo: 'Interno',
      Id_Porcino: porcinos[0].Id_Porcino,
      Id_Responsable: responsables[0].Id_Responsable,
      volumen: 120.5,
      color: 'Blanco',
      olor: 'Normal',
      cant_generada: 10,
      cant_utilizada: 5,
      Observaciones: 'Colecta normal'
    })

    // ===== INSEMINACIÓN =====
    await Inseminacion.create({
      Fec_hora: new Date(),
      Id_Porcino: porcinos[1].Id_Porcino,
      cantidad: 2,
      Id_Responsable: responsables[1].Id_Responsable,
      Id_colecta: colecta.Id_colecta,
      Observaciones: 'Proceso exitoso',
      Id_Reproduccion: reproduccion.Id_Reproduccion
    })

    // ===== MEDICAMENTOS =====
    await Medicamento.bulkCreate([
      {
        Nombre: 'Vitamina A',
        Tipo: 'Vitamina',
        Presentacion: 'Inyectable',
        Observaciones: 'Uso mensual'
      },
      {
        Nombre: 'Antibiótico X',
        Tipo: 'Antibiotico',
        Presentacion: 'Oral',
        Observaciones: 'Solo en caso necesario'
      }
    ])

    // ===== PARTO =====
    await Parto.create({
      Id_Porcino: porcinos[1].Id_Porcino,
      Fec_inicio: new Date(),
      Hor_inicial: '08:00',
      Nac_vivos: 8,
      Nac_momias: 1,
      Nac_muertos: 0,
      Pes_camada: 12.5,
      Observaciones: 'Parto exitoso',
      Fec_fin: new Date(),
      Hor_final: '10:00'
    })

    console.log('🚀 Datos de prueba insertados correctamente')
    process.exit()

  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

seed()