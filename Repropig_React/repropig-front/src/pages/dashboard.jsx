import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiAxios from '../api/axiosConfig'

const Dashboard = () => {
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
        { nombre: 'Razas', icono: '🧬', ruta: '/razas', color: '#FFD6A5', desc: 'Información genética' },
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

    return (
        <div style={{ minHeight: '100vh', background: '#FFF8F9', padding: '32px 24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Bienvenida */}
                <div style={{
                    background: 'linear-gradient(135deg, #E8A0A8, #C97A85)',
                    borderRadius: '20px', padding: '36px 40px', marginBottom: '32px',
                    color: 'white', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', fontSize: '80px', opacity: 0.3 }}>🐖</div>
                    <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>{saludo},</p>
                    <h1 style={{ margin: '4px 0 8px', fontSize: '2rem', fontWeight: 'bold' }}>
                        {usuario?.nombres} {usuario?.apellidos} 👋
                    </h1>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '1rem' }}>
                        ¿Qué quieres gestionar hoy en ReproPig?
                    </p>
                    <span style={{
                        display: 'inline-block', marginTop: '12px',
                        background: 'rgba(255,255,255,0.2)', borderRadius: '20px',
                        padding: '4px 14px', fontSize: '0.85rem'
                    }}>
                        {usuario?.cargo}
                    </span>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {statCards.map(s => (
                        <div key={s.label} style={{
                            background: 'white', borderRadius: '16px', padding: '24px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                            borderLeft: `4px solid ${s.color}`
                        }}>
                            <div style={{ fontSize: '2rem' }}>{s.icono}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: '8px 0 4px' }}>
                                {s.valor}
                            </div>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

                    {/* Módulos */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h5 style={{ color: '#C97A85', fontWeight: 'bold', marginBottom: '16px' }}>
                            🚀 Acceso rápido
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {modulos.map(m => (
                                <div key={m.nombre}
                                    onClick={() => navigate(m.ruta)}
                                    style={{
                                        background: m.color + '33',
                                        border: `1px solid ${m.color}`,
                                        borderRadius: '12px', padding: '12px',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <span style={{ fontSize: '1.4rem' }}>{m.icono}</span>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#333' }}>{m.nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{m.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Últimas reproducciones */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h5 style={{ color: '#C97A85', fontWeight: 'bold', marginBottom: '16px' }}>
                            🕐 Últimas reproducciones
                        </h5>
                        {ultimasReproducciones.length === 0 ? (
                            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>
                                No hay reproducciones registradas
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {ultimasReproducciones.map(r => (
                                    <div key={r.Id_Reproduccion} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px', borderRadius: '10px',
                                        background: r.TipoReproduccion === 'Monta' ? '#FFF0F3' : '#F0F4FF'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.4rem' }}>
                                                {r.TipoReproduccion === 'Monta' ? '🐷' : '💉'}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
                                                    {r.porcino?.Nom_Porcino || `Porcino #${r.Id_Cerda}`}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: '#888' }}>
                                                    {r.TipoReproduccion || 'Sin tipo'}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                            background: r.Activo === 'Si' ? '#CAFFBF' : '#FFE0E0',
                                            color: r.Activo === 'Si' ? '#2d6a2d' : '#a33'
                                        }}>
                                            {r.Activo === 'Si' ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => navigate('/reproducciones')}
                            style={{
                                marginTop: '16px', width: '100%', padding: '10px',
                                background: 'linear-gradient(135deg, #E8A0A8, #C97A85)',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: '600', cursor: 'pointer'
                            }}>
                            Ver todas las reproducciones →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard