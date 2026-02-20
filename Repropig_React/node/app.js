import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import porcinoRoutes from './routes/porcinoRoutes.js'
import razaRoutes from './routes/razaRoutes.js'
import NacimientoRoutes from './routes/NacimientoRoutes.js'
import MedicamentosRoutes from './routes/MedicamentosRoutes.js'
import PartosRoutes from './routes/PartosRoutes.js'
import responsablesRoutes from './routes/responsablesRoutes.js'
import reproduccionesRoutes from './routes/reproduccionesRoutes.js'
import dotenv from 'dotenv'
import MedicamentosModel from './models/MedicamentosModel.js'
import ResponsablesModel from './models/responsablesModel.js'
import PorcinoModel from './models/porcinoModel.js'

const app = express()

app.use(express.json())
app.use(cors())


app.use('/api/porcino', porcinoRoutes)
app.use('/api/raza', razaRoutes)
app.use('/api/Nacimiento',NacimientoRoutes)
app.use('/api/medicamentos', MedicamentosRoutes)
app.use('/api/Partos', PartosRoutes)
app.use('/api/responsables', responsablesRoutes)
app.use('/api/reproducciones', reproduccionesRoutes)


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
export default app