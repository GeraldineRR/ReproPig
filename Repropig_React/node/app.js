import express from 'express'
import cors from 'cors'
import db from './database/db.js'

import responsablesRoutes from './routes/responsablesRoutes.js'

import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

// Archivos estáticos
app.use('/public/uploads', express.static('public/uploads'))

// Rutas API

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

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server up running in http://localhost:${PORT}`)
})

export default app