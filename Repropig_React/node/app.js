import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import porcinoRoutes from './routes/porcinoRoutes.js'
import razaRoutes from './routes/razaRoutes.js'
import MedicamentosRoutes from './routes/MedicamentosRoutes.js'
import reproduccionesRoutes from './routes/reproduccionesRoutes.js'
import colectaRoutes from './routes/colectaRoutes.js'
import responsablesRoutes from './routes/responsablesRoutes.js'
import Seguimiento_CerdaRoutes from './routes/Seguimiento_CerdaRoutes.js'
import montaRoutes from './routes/montaRoutes.js'
import inseminacionRoutes from './routes/inseminacionRoutes.js'
import MedicamentosModel from './models/MedicamentosModel.js'
import Seguimiento_CerdaModel from './models/Seguimiento_CerdaModel.js'
import responsablesModel from './models/responsablesModel.js'
import dotenv from 'dotenv'



import PorcinoModel from './models/porcinoModel.js'
import RazaModel from './models/razaModel.js'
import montaModel from './models/montaModel.js'
import colectaModel from './models/colectaModel.js'
import inseminacionModel from './models/inseminacionModel.js'


const app = express()

app.use(express.json())
app.use(cors())

// Rutas
app.use('/api/porcino', porcinoRoutes)
app.use('/api/raza', razaRoutes)
app.use('/api/medicamentos', MedicamentosRoutes)
app.use('/api/reproducciones', reproduccionesRoutes)
app.use('/api/colecta', colectaRoutes)
app.use('/api/monta', montaRoutes)
app.use('/api/inseminacion', inseminacionRoutes)
app.use('/api/Seguimiento_Cerda', Seguimiento_CerdaRoutes)


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

dotenv.config();
const PORT = process.env.PORT || 8000;

// Relaciones
PorcinoModel.belongsTo(RazaModel, { foreignKey: 'Id_Raza', as: 'razas' })
RazaModel.hasMany(PorcinoModel, { foreignKey: 'Id_Raza', as: 'porcinos' })

colectaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(colectaModel, { foreignKey: 'Id_Porcino', as: 'colectas' })

montaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(montaModel, { foreignKey: 'Id_Porcino', as: 'montas' })

inseminacionModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as: 'porcino' })
PorcinoModel.hasMany(inseminacionModel, { foreignKey: 'Id_Porcino', as: 'inseminaciones' })

responsablesModel.hasMany(Seguimiento_CerdaModel, { foreignKey: 'Id_Responsable', as : 'Seguimiento Cerda' })
Seguimiento_CerdaModel.belongsTo(responsablesModel, { foreignKey: 'Id_Responsable', as : 'Responsables' })

PorcinoModel.hasMany(Seguimiento_CerdaModel, { foreignKey: 'Id_Porcino', as : 'Seguimiento Cerda' })
Seguimiento_CerdaModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as : 'porcinos' })

app.listen(PORT, () => {
    console.log(`Server up running in http://localhost:${PORT}`)
})

export default app