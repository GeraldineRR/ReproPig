import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiAxios from '../api/axiosConfig'

const Home = () => {
    const { usuario } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({ porcinos: 0, colectas: 0, montas: 0, inseminaciones: 0, reproducciones: 0 })
    const [ultimasReproducciones, setUltimasReproducciones] = useState([])
    const hora = new Date().getHours()
    const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [porcinos, colectas, montas, inseminaciones, reproducciones] = await Promise.all([
                apiAxios.get('/porcino'),
                apiAxios.get('/colectas'),
                apiAxios.get('/monta'),
                apiAxios.get('/inseminacion'),
                apiAxios.get('/reproducciones/')
            ])
            setStats({
                porcinos: porcinos.data.length,
                colectas: colectas.data.length,
                montas: montas.data.length,
                inseminaciones: inseminaciones.data.length,
                reproducciones: reproducciones.data.length
            })
            // Últimas 5 reproducciones
            const ultimas = [...reproducciones.data].reverse().slice(0, 5)
            setUltimasReproducciones(ultimas)
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error)
        }
    }

    const modulos = [
        { nombre: 'Porcinos', icono: '🐖', ruta: '/porcinos', color: '#FFB3C6', desc: 'Gestiona tu plantel' },
        { nombre: 'Reproducciones', icono: '🔄', ruta: '/reproducciones', color: '#C9B8FF', desc: 'Control reproductivo' },
        { nombre: 'Montas', icono: '🐷', ruta: '/montas', color: '#FFD6A5', desc: 'Monta natural' },
        { nombre: 'Inseminaciones', icono: '💉', ruta: '/inseminaciones', color: '#CAFFBF', desc: 'Inseminación artificial' },
        { nombre: 'Colectas', icono: '🧪', ruta: '/colectas', color: '#A0C4FF', desc: 'Material genético' },
        { nombre: 'Medicamentos', icono: '💊', ruta: '/medicamentos', color: '#FFC6FF', desc: 'Control sanitario' },
        { nombre: 'Responsables', icono: '👥', ruta: '/responsables', color: '#FDFFB6', desc: 'Equipo de trabajo' },
    ]

    const statCards = [
        { label: 'Porcinos', valor: stats.porcinos, icono: '🐖', color: '#FFB3C6' },
        { label: 'Reproducciones', valor: stats.reproducciones, icono: '🔄', color: '#C9B8FF' },
        { label: 'Colectas', valor: stats.colectas, icono: '🧪', color: '#A0C4FF' },
        { label: 'Inseminaciones', valor: stats.inseminaciones, icono: '💉', color: '#CAFFBF' },
    ]

}

export default Home