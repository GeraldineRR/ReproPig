import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import db from './database/db.js'

// ====== Models ======
import ciclosModel from './models/ciclosModel.js'
import MedicamentosModel from './models/MedicamentosModel.js'
import PorcinoModel from './models/porcinoModel.js'
import RazaModel from './models/razaModel.js'
import montaModel from './models/montaModel.js'
import colectaModel from './models/colectaModel.js'
import inseminacionModel from './models/inseminacionModel.js'
import PartosModel from './models/PartosModel.js'
import ActividadesCamadaModel from './models/actividadesCamadaModel.js'
import responsablesModel from './models/responsablesModel.js'
import SeguimientoCerda_Model from './models/Seguimiento_CerdaModel.js'
import CalendarioModel from './models/CalendarioModel.js'
import NovedadesModel from './models/novedadesModel.js'
import segcamadaModel from './models/segcamadaModel.js'


// ====== Relaciones (ANTES de importar rutas) ======
PorcinoModel.belongsTo(RazaModel, { foreignKey: 'Id_Raza', as: 'raza' })
RazaModel.hasMany(PorcinoModel, { foreignKey: 'Id_Raza', as: 'porcinos' })

PartosModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(PartosModel, { foreignKey: 'Id_Porcino', as: 'partos' })

PorcinoModel.belongsTo(PartosModel, { foreignKey: 'Id_parto', as: 'parto' })
PartosModel.hasMany(PorcinoModel, { foreignKey: 'Id_parto', as: 'lechones' })


// MedicamentosModel.hasMany(ActividadesCamadaModel, { foreignKey: 'Id_Medicamento', as: 'actividades_camada' })
// ActividadesCamadaModel.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as: 'medicamentos' })


NovedadesModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(NovedadesModel, { foreignKey: 'Id_Porcino', as: 'novedades' })

colectaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(colectaModel, { foreignKey: 'Id_Porcino', as: 'colectas' })

montaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(montaModel, { foreignKey: 'Id_Porcino', as: 'montas' })

montaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Cerdo', as: 'cerdo' })

inseminacionModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(inseminacionModel, { foreignKey: 'Id_Porcino', as: 'inseminaciones' })

ciclosModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Cerda', as: 'porcino' })
PorcinoModel.hasMany(ciclosModel, { foreignKey: 'Id_Cerda', as: 'ciclos' })

ciclosModel.hasMany(montaModel, { foreignKey: 'Id_Ciclo', as: 'montas' })
ciclosModel.hasMany(inseminacionModel, { foreignKey: 'Id_Ciclo', as: 'inseminaciones' })

responsablesModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Responsable', as: 'seguimiento_cerda' })
SeguimientoCerda_Model.belongsTo(responsablesModel, { foreignKey: 'Id_Responsable', as: 'Responsables' })

PartosModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_parto', as: 'seguimiento_cerda' })
SeguimientoCerda_Model.belongsTo(PartosModel, { foreignKey: 'Id_parto', as: 'partos' })

MedicamentosModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Medicamento', as: 'seguimiento_cerda' })
SeguimientoCerda_Model.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as: 'medicamentos' })

ciclosModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Ciclo', as: 'seguimiento_cerda' })
SeguimientoCerda_Model.belongsTo(ciclosModel, { foreignKey: 'Id_Ciclo', as: 'ciclo' })

PorcinoModel.hasMany(segcamadaModel, { foreignKey: 'Id_Porcino', as: 'segcamadas' })
segcamadaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })

MedicamentosModel.hasMany(segcamadaModel, { foreignKey: 'Id_Medicamento', as: 'segcamadas' })
segcamadaModel.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as: 'medicamentos' })

segcamadaModel.hasMany(ActividadesCamadaModel, { foreignKey: 'Id_SegCamada', as: 'actividades_camada' })
ActividadesCamadaModel.belongsTo(segcamadaModel, { foreignKey: 'Id_SegCamada', as: 'segcamada' })

ciclosModel.hasMany(PartosModel, { foreignKey: 'Id_Ciclo', as: 'partos' })
PartosModel.belongsTo(ciclosModel, { foreignKey: 'Id_Ciclo', as: 'ciclo' })

CalendarioModel.belongsTo(ciclosModel, { foreignKey: 'Id_Ciclo', as: 'ciclo' })
ciclosModel.hasOne(CalendarioModel, { foreignKey: 'Id_Ciclo', as: 'calendario' })

// ====== Rutas ======
import porcinoRoutes from './routes/porcinoRoutes.js'
import razaRoutes from './routes/razaRoutes.js'
import MedicamentosRoutes from './routes/MedicamentosRoutes.js'
import ciclosRoutes from './routes/ciclosRoutes.js'
import colectaRoutes from './routes/colectaRoutes.js'
import montaRoutes from './routes/montaRoutes.js'
import inseminacionRoutes from './routes/inseminacionRoutes.js'
import responsablesRoutes from './routes/responsablesRoutes.js'
import PartosRoutes from './routes/PartosRoutes.js'
import Seguimiento_CerdaRoutes from './routes/Seguimiento_CerdaRoutes.js'
import authRoutes from './routes/authRoutes.js'
import actividadesCamadaRoutes from './routes/actividadesCamadaRoutes.js'
import calendarioRoutes from './routes/CalendarioRoutes.js'
import novedadesRoutes from './routes/novedadesRoutes.js'
import segcamadaRoutes from './routes/segcamadaRoutes.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/porcino', porcinoRoutes)
app.use('/api/raza', razaRoutes)
app.use('/api/medicamentos', MedicamentosRoutes)
app.use('/api/ciclos', ciclosRoutes)
app.use('/api/colectas', colectaRoutes)
app.use('/api/monta', montaRoutes)
app.use('/api/inseminacion', inseminacionRoutes)
app.use('/api/Partos', PartosRoutes)
app.use('/api/responsables', responsablesRoutes)
app.use('/api/actividades_camada', actividadesCamadaRoutes)
app.use('/api/Seguimiento_Cerda', Seguimiento_CerdaRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/calendario', calendarioRoutes)
app.use('/api/novedades', novedadesRoutes)
app.use('/api/segcamada', segcamadaRoutes)

app.get('/', (req, res) => {
    res.send('Hola mundo ADSO')
})

async function migrateCalendario() {
  const columns = [
    { name: 'resultado_rc1', type: 'VARCHAR(20) NULL' },
    { name: 'resultado_rc2', type: 'VARCHAR(20) NULL' },
    { name: 'observaciones_rc1', type: 'TEXT NULL' },
    { name: 'observaciones_rc2', type: 'TEXT NULL' },
    { name: 'observaciones_cambio', type: 'TEXT NULL' },
    { name: 'observaciones_107', type: 'TEXT NULL' },
    { name: 'observaciones_parto', type: 'TEXT NULL' }
  ];

  for (const col of columns) {
    try {
      await db.query(`ALTER TABLE \`Calendario\` ADD COLUMN \`${col.name}\` ${col.type};`);
      console.log(`✅ Columna ${col.name} agregada a Calendario`);
    } catch (err) {
      if (err.parent?.code !== 'ER_DUP_COLUMNNAME') {
        console.error(`⚠️ Error al agregar columna ${col.name}:`, err.message);
      }
    }
  }
}

try {
    await db.authenticate()
    console.log('✅ Conexión a la base de datos exitosa')

    try {
        await db.query("ALTER TABLE actividades_camada MODIFY COLUMN Id_Medicamento TEXT NULL;")
    } catch (e) {
        console.log("Aviso alter Id_Medicamento:", e.message)
    }

    try {
        await db.query("ALTER TABLE actividades_camada ADD COLUMN Id_Responsable TEXT NULL;")
    } catch (e) {
        console.log("Aviso alter Id_Responsable:", e.message)
    }

    try {
        await db.query("ALTER TABLE partos ADD COLUMN Id_Responsable TEXT NULL;")
    } catch (e) {
        console.log("Aviso alter partos Id_Responsable:", e.message)
    }

    try {
        await db.query("ALTER TABLE monta ADD COLUMN estado VARCHAR(10) DEFAULT 'Activo';")
    } catch (e) {
        console.log("Aviso alter monta estado:", e.message)
    }

    try {
        await db.query("ALTER TABLE inseminacion ADD COLUMN estado VARCHAR(10) DEFAULT 'Activo';")
    } catch (e) {
        console.log("Aviso alter inseminacion estado:", e.message)
    }

    console.log('✅ Base de datos sincronizada')
} catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error)
    process.exit(1)
}

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app