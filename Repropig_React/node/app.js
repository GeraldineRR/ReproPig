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
import Seguimiento_CerdaRoutes from './routes/Seguimiento_CerdaRoutes.js'
import authRoutes from './routes/authRoutes.js'
import criaRoutes from './routes/criaRoutes.js'
import segcamadaRoutes from './routes/segcamadaRoutes.js'
import Seguimiento_CerdaRoutes from './routes/Seguimiento_CerdaRoutes.js'

import dotenv from 'dotenv'
dotenv.config()

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
import Seguimiento_CerdaModel from './models/Seguimiento_CerdaModel.js'
import responsablesModel from './models/responsablesModel.js'
// ❌ ResponsablesModel ya no se necesita para asociaciones

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
app.use('/api/Seguimiento_Cerda',Seguimiento_CerdaRoutes)

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

// ====== Relaciones Cria ======
CriaModel.belongsTo(PartosModel, { foreignKey: 'Id_parto', as: 'partos' })
PartosModel.hasMany(CriaModel, { foreignKey: 'Id_parto', as: 'crias' })

// ====== Relaciones Segcamada ======
SegcamadaModel.belongsTo(CriaModel, { foreignKey: 'Id_Cria', as: 'crias' })
CriaModel.hasMany(SegcamadaModel, { foreignKey: 'Id_Cria', as: 'segcamada' })

SegcamadaModel.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as: 'medicamentos' })
MedicamentosModel.hasMany(SegcamadaModel, { foreignKey: 'Id_Medicamento', as: 'segcamada' })


// ====== Relaciones Seguimiento_Cerda ======
responsablesModel.hasMany(Seguimiento_CerdaModel, { foreignKey: 'Id_Responsable', as : 'seguimiento_cerda' })
Seguimiento_CerdaModel.belongsTo(responsablesModel, { foreignKey: 'Id_Responsable', as : 'responsable' })

PorcinoModel.hasMany(Seguimiento_CerdaModel, { foreignKey: 'Id_Porcino', as : 'seguimiento_cerda' })
Seguimiento_CerdaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as : 'porcinos' })

MedicamentosModel.hasMany(Seguimiento_CerdaModel, { foreignKey: 'Id_Medicamento', as : 'seguimiento_cerda' })
Seguimiento_CerdaModel.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as : 'medicamentos' })


// ====== Relaciones Parto ======
PartosModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcinos' })
PorcinoModel.hasMany(PartosModel, { foreignKey: 'Id_Porcino', as: 'partos' })

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
reproduccionesModel.hasMany(montaModel, { foreignKey: 'Id_Reproduccion', as: 'montas' })
reproduccionesModel.hasMany(inseminacionModel, { foreignKey: 'Id_Reproduccion', as: 'inseminaciones' })
// ====== Relaciones Seguimiento Cerda ======
responsablesModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Responsable', as: 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(responsablesModel, { foreignKey: 'Id_Responsable', as: 'Responsables' })

PorcinoModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Porcino', as: 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcinos' })

MedicamentosModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Medicamento', as: 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as: 'medicamentos' })


app.listen(PORT, () => {
    console.log(`Server up running in http://localhost:${PORT}`)
})

export default app