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

// Models
import reproduccionesModel from './models/reproduccionesModel.js'
import MedicamentosModel from './models/MedicamentosModel.js'
import PorcinoModel from './models/porcinoModel.js'
import RazaModel from './models/razaModel.js'
import montaModel from './models/montaModel.js'
import colectaModel from './models/colectaModel.js'
import inseminacionModel from './models/inseminacionModel.js'
import PartosModel from './models/PartosModel.js'
import responsablesModel from './models/responsablesModel.js'
import SeguimientoCerda_Model from './models/Seguimiento_CerdaModel.js'

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
app.use('/api/auth', authRoutes)
app.use('/api/Seguimiento_Cerda', Seguimiento_CerdaRoutes)

// ====== Relaciones ======
PorcinoModel.belongsTo(RazaModel, { foreignKey: 'Id_Raza', as: 'razas' })
RazaModel.hasMany(PorcinoModel, { foreignKey: 'Id_Raza', as: 'porcinos' })

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