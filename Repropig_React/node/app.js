import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import Seguimiento_CerdaRoutes from './routes/Seguimiento_CerdaRoutes.js'
import porcinoRoutes from './routes/porcinoRoutes.js'
import responsablesRoutes from './routes/responsablesRoutes.js'

import razaRoutes from './routes/razaRoutes.js'
import MedicamentosRoutes from './routes/MedicamentosRoutes.js'

import dotenv from 'dotenv'
import SeguimientoCerda_Model from './models/Seguimiento_CerdaModel.js'
import responsablesModel from './models/responsablesModel.js'
import PorcinoModel from './models/porcinoModel.js'
import MedicamentosModel from './models/MedicamentosModel.js'

const app = express()

app.use(express.json())
app.use(cors())


app.use('/api/porcino', porcinoRoutes)
app.use('/api/raza', razaRoutes)
app.use('/api/responsables', responsablesRoutes)
app.use('/api/medicamentos', MedicamentosRoutes)
app.use('/api/Seguimiento_Cerda',Seguimiento_CerdaRoutes)

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

app.listen(PORT, () => {
    console.log(`Server up running in http://localhost:${PORT}`)
})

responsablesModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Responsable', as : 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(responsablesModel, { foreignKey: 'Id_Responsable', as : 'Responsables' })

PorcinoModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Porcino', as : 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(PorcinoModel, { foreignKey: 'Id_Porcino', as : 'porcinos' })

MedicamentosModel.hasMany(SeguimientoCerda_Model, { foreignKey: 'Id_Medicamento', as : 'Seguimiento Cerda' })
SeguimientoCerda_Model.belongsTo(MedicamentosModel, { foreignKey: 'Id_Medicamento', as : 'medicamentos' })

export default app