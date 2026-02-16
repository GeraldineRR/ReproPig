import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import porcinoRoutes from './routes/porcinoRoutes.js'
import razaRoutes from './routes/razaRoutes.js'
import dotenv from 'dotenv'
import PorcinoModel from './models/porcinoModel.js'
import RazaModel from './models/razaModel.js'
import { fileURLToPath } from 'url'
import path from 'path'

const app = express()

app.use(express.json())
app.use(cors())


app.use('/api/porcino', porcinoRoutes)
app.use('/api/raza', razaRoutes)


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

PorcinoModel.belongsTo(RazaModel, { foreignKey: 'Id_Raza', as : 'razas' })
RazaModel.hasMany(PorcinoModel, { foreignKey: 'Id_Raza', as : 'porcinos' })
export default app