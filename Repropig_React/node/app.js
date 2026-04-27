import express from 'express'
import cors from 'cors'
import db from './database/db.js'

// Rutas
import porcinoRoutes from './routes/porcinoRoutes.js'
import razaRoutes from './routes/razaRoutes.js'
import MedicamentosRoutes from './routes/MedicamentosRoutes.js'
import reproduccionesRoutes from './routes/reproduccionesRoutes.js'
import colectaRoutes from './routes/colectaRoutes.js'
import montaRoutes from './routes/montaRoutes.js'
import inseminacionRoutes from './routes/inseminacionRoutes.js'
import responsablesRoutes from './routes/responsablesRoutes.js'
import PartosRoutes from './routes/PartosRoutes.js'
import Seguimiento_CerdaRoutes from './routes/Seguimiento_CerdaRoutes.js'
import authRoutes from './routes/authRoutes.js'
import criaRoutes from './routes/criaRoutes.js'
import segcamadaRoutes from './routes/segcamadaRoutes.js'
import calendarioRoutes from './routes/calendarioRoutes.js'

// Models
import reproduccionesModel from './models/reproduccionesModel.js'
import MedicamentosModel from './models/MedicamentosModel.js'
import PorcinoModel from './models/porcinoModel.js'
import RazaModel from './models/razaModel.js'
import montaModel from './models/montaModel.js'
import colectaModel from './models/colectaModel.js'
import inseminacionModel from './models/inseminacionModel.js'
import PartosModel from './models/PartosModel.js'
import CriaModel from './models/criaModel.js'
import SegcamadaModel from './models/segcamadaModel.js'
import responsablesModel from './models/responsablesModel.js'
import SeguimientoCerda_Model from './models/Seguimiento_CerdaModel.js'
import CalendarioModel from './models/CalendarioModel.js'

// 🔥 SOLO para el PORT
import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

// Rutas
app.use('/api/porcino', porcinoRoutes)
app.use('/api/raza', razaRoutes)
app.use('/api/medicamentos', MedicamentosRoutes)
app.use('/api/reproducciones', reproduccionesRoutes)
app.use('/api/colectas', colectaRoutes)
app.use('/api/monta', montaRoutes)
app.use('/api/inseminacion', inseminacionRoutes)
app.use('/api/Partos', PartosRoutes)
app.use('/api/responsables', responsablesRoutes)
app.use('/api/cria', criaRoutes)
app.use('/api/segcamada', segcamadaRoutes)
app.use('/api/Seguimiento_Cerda', Seguimiento_CerdaRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/calendario', calendarioRoutes)

// ====== Relaciones ======
PorcinoModel.belongsTo(RazaModel, { foreignKey: 'Id_Raza', as: 'razas' })
RazaModel.hasMany(PorcinoModel, { foreignKey: 'Id_Raza', as: 'porcinos' })

PartosModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcinos' })
PorcinoModel.hasMany(PartosModel, { foreignKey: 'Id_Porcino', as: 'partos' })

CriaModel.belongsTo(PartosModel, { foreignKey: 'Id_parto', as: 'partos' })
PartosModel.hasMany(CriaModel, { foreignKey: 'Id_parto', as: 'crias' })

SegcamadaModel.belongsTo(CriaModel, { foreignKey: 'Id_Cria', as: 'crias' })
CriaModel.hasMany(SegcamadaModel, { foreignKey: 'Id_Cria', as: 'segcamada' })

colectaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(colectaModel, { foreignKey: 'Id_Porcino', as: 'colectas' })

montaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(montaModel, { foreignKey: 'Id_Porcino', as: 'montas' })

inseminacionModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(inseminacionModel, { foreignKey: 'Id_Porcino', as: 'inseminaciones' })

reproduccionesModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Cerda', as: 'porcino' })
PorcinoModel.hasMany(reproduccionesModel, { foreignKey: 'Id_Cerda', as: 'reproducciones' })

reproduccionesModel.hasMany(montaModel, { foreignKey: 'Id_Reproduccion', as: 'montas' })
reproduccionesModel.hasMany(inseminacionModel, { foreignKey: 'Id_Reproduccion', as: 'inseminaciones' })

responsablesModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Responsable', as: 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(responsablesModel, { foreignKey: 'Id_Responsable', as: 'Responsables' })

PorcinoModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Porcino', as: 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcinos' })

MedicamentosModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Medicamento', as: 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as: 'medicamentos' })

CalendarioModel.belongsTo(reproduccionesModel, { foreignKey: 'Id_Reproduccion', as: 'reproduccion' })
reproduccionesModel.hasOne(CalendarioModel, { foreignKey: 'Id_Reproduccion', as: 'calendario' })

// ====== Conexión DB ======
try {
  await db.authenticate()
  console.log('Conexión a la base de datos exitosa')

  await db.sync()
  console.log('Base de datos sincronizada')
} catch (error) {
  console.error('Error al conectar a la base de datos:', error)
  process.exit(1)
}

// Ruta base
app.get('/', (req, res) => {
  res.send('Hola mundo ADSO')
})

// Puerto
const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app