import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import porcinoRoutes from './routes/porcinoRoutes.js'
import razaRoutes from './routes/razaRoutes.js'
import MedicamentosRoutes from './routes/MedicamentosRoutes.js'
import reproduccionesRoutes from './routes/reproduccionesRoutes.js'
import colectaRoutes from './routes/colectaRoutes.js'
import montaRoutes from './routes/montaRoutes.js'
import inseminacionRoutes from './routes/inseminacionRoutes.js'
import responsablesRoutes from './routes/responsablesRoutes.js'
import PartosRoutes from './routes/PartosRoutes.js'
import authRoutes from './routes/authRoutes.js'

import dotenv from 'dotenv'
dotenv.config()

import reproduccionesModel from './models/reproduccionesModel.js'
import MedicamentosModel from './models/MedicamentosModel.js'
import PorcinoModel from './models/porcinoModel.js'
import RazaModel from './models/razaModel.js'
import montaModel from './models/montaModel.js'
import colectaModel from './models/colectaModel.js'
import inseminacionModel from './models/inseminacionModel.js'
<<<<<<< HEAD
=======
import PartosModel from './models/PartosModel.js'
// ❌ ResponsablesModel ya no se necesita para asociaciones
>>>>>>> 71ab774b4f6eef6d4292744ebcb7f237724fbc7f

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

// Conexión DB
try {
    await db.authenticate()
    console.log('Conexión a la base de datos exitosa')
} catch (error) {
    console.error('Error al conectar a la base de datos:', error)
    process.exit(1)
}

app.get('/', (req, res) => {
    res.send('Hola mundo ADSO')
})

const PORT = process.env.PORT || 8000

// ====== Relaciones Porcino ======
PorcinoModel.belongsTo(RazaModel, { foreignKey: 'Id_Raza', as: 'razas' })
RazaModel.hasMany(PorcinoModel, { foreignKey: 'Id_Raza', as: 'porcinos' })

// ====== Relaciones Colecta ======
colectaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(colectaModel, { foreignKey: 'Id_Porcino', as: 'colectas' })
// ❌ Quitadas asociaciones colecta → responsable (Id_Responsables es JSON text, no FK)

// ====== Relaciones Monta ======
montaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(montaModel, { foreignKey: 'Id_Porcino', as: 'montas' })
// ❌ Quitadas asociaciones monta → responsable

// ====== Relaciones Inseminacion ======
inseminacionModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(inseminacionModel, { foreignKey: 'Id_Porcino', as: 'inseminaciones' })
// ❌ Quitadas asociaciones inseminacion → responsable

// ====== Relaciones Reproduccion ======
reproduccionesModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Cerda', as: 'porcino' })
PorcinoModel.hasMany(reproduccionesModel, { foreignKey: 'Id_Cerda', as: 'reproducciones' })

// 

app.listen(PORT, () => {
    console.log(`Server up running in http://localhost:${PORT}`)
})

export default app