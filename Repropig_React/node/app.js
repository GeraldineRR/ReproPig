import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import porcinoRoutes from './routes/porcinoRoutes.js'
import razaRoutes from './routes/razaRoutes.js'
import NacimientoRoutes from './routes/NacimientoRoutes.js'
import mortalidadRoutes from './routes/mortalidadRoutes.js'
import PartosRoutes from './routes/PartosRoutes.js'
import responsablesRoutes from './routes/responsablesRoutes.js'
import dotenv from 'dotenv'

const app = express()

app.use(express.json())
app.use(cors())


app.use('/api/porcino', porcinoRoutes)
app.use('/api/raza', razaRoutes)
app.use('/api/Nacimiento',NacimientoRoutes)
app.use('/api/mortalidad', mortalidadRoutes)
app.use('/api/Partos', PartosRoutes)
app.use('/api/responsables', responsablesRoutes)


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