import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../api/axiosConfig"

export default function PerfilCerda() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [porcino, setPorcino] = useState(null)
    const [reproducciones, setReproducciones] = useState([])
    const [partos, setPartos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cargarDatos()
    }, [id])

    const cargarDatos = async () => {
        try {
            setLoading(true)
            
            // Traer datos principales de la cerda
            const resPorcino = await apiAxios.get(`/porcino/${id}`)
            setPorcino(resPorcino.data)

            // Traer reproducciones
            const resRepro = await apiAxios.get('/reproducciones/')
            const reprosDeCerda = resRepro.data.filter(r => r.Id_Cerda == id)
            setReproducciones(reprosDeCerda)

            // Traer partos
            const resPartos = await apiAxios.get('/partos/')
            const partosDeCerda = resPartos.data.filter(p => p.Id_Porcino == id)
            setPartos(partosDeCerda)

        } catch (error) {
            console.error("Error al cargar perfil:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-screen w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
        </div>
    )
    if (!porcino) return <div className="p-10 text-center mt-5 text-gray-500 text-xl font-medium">Cerda no encontrada</div>

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header / Top Bar */}
            <div className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-pink-600 transition-colors font-medium">
                    <i className="fa-solid fa-arrow-left mr-2"></i> Volver a Porcinos
                </button>
                <div className="text-sm text-gray-400 font-medium">Perfil Clínico y Reproductivo</div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* COLUMNA IZQUIERDA: Info Principal */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Tarjeta de Identidad */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-br from-pink-100 to-pink-50 pt-8 pb-6 px-6 text-center relative">
                                <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-700 shadow-sm">
                                    ID: {porcino.Id_Porcino}
                                </div>
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-md mb-4 text-4xl border-4 border-pink-50">
                                    🐷
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">{porcino.Nom_Porcino}</h2>
                                <p className="text-gray-500 font-medium mb-3">Chapeta: <span className="text-gray-800 font-bold">{porcino.Num_Chapeta}</span></p>
                                <span className="inline-block bg-pink-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
                                    {porcino.razas?.Nom_Raza || 'Sin raza definida'}
                                </span>
                            </div>
                            
                            <div className="p-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Información General</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center"><i className="fa-solid fa-id-card w-5 text-gray-400"></i> Placa SENA</span>
                                        <span className="font-semibold text-gray-800">{porcino.Plac_Sena_Porcino}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center"><i className="fa-solid fa-cake-candles w-5 text-gray-400"></i> Nacimiento</span>
                                        <span className="font-semibold text-gray-800">{porcino.Fec_Nac_Porcino}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center"><i className="fa-solid fa-truck-ramp-box w-5 text-gray-400"></i> Llegada</span>
                                        <span className="font-semibold text-gray-800">{porcino.Fec_Llegada}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center"><i className="fa-solid fa-weight-scale w-5 text-gray-400"></i> Peso Inicial</span>
                                        <span className="font-semibold text-gray-800">{porcino.Peso_Llegada} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-500 flex items-center"><i className="fa-solid fa-location-dot w-5 text-gray-400"></i> Origen</span>
                                        <div className="text-right">
                                            <span className="font-semibold text-gray-800 block">{porcino.Proc_Porcino}</span>
                                            <span className="text-xs text-gray-400">{porcino.Lug_Proc_Porcino}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: Historiales */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Ciclos Reproductivos */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-rotate"></i>
                                    </div>
                                    Ciclos Reproductivos
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {reproducciones.length} Total
                                </span>
                            </div>

                            {reproducciones.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No hay reproducciones registradas para esta cerda.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                    {reproducciones.map((repro) => (
                                        <div key={repro.Id_Reproduccion} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-gray-50/50 relative overflow-hidden group">
                                            {/* Indicador de estado */}
                                            <div className={`absolute top-0 left-0 w-1 h-full ${repro.Activo === 'S' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ciclo #{repro.Id_Reproduccion}</span>
                                                    <h4 className="text-lg font-bold text-gray-800 mt-1">{repro.TipoReproduccion}</h4>
                                                </div>
                                                {repro.Activo === 'S' ? 
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Activa
                                                    </span> 
                                                    : 
                                                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">Cerrada</span>
                                                }
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-gray-100">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Montas</p>
                                                    <p className="text-xl font-black text-gray-700">{repro.montas?.length || 0}</p>
                                                </div>
                                                <div className="text-center border-l border-gray-100">
                                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Insem.</p>
                                                    <p className="text-xl font-black text-gray-700">{repro.inseminaciones?.length || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Historial de Partos */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-baby-carriage"></i>
                                    </div>
                                    Historial de Partos
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {partos.length} Total
                                </span>
                            </div>

                            {partos.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No hay partos registrados para esta cerda.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {partos.map(parto => (
                                        <div key={parto.Id_parto} className="flex flex-col sm:flex-row items-center bg-white border border-gray-100 shadow-sm rounded-2xl p-4 hover:border-green-200 transition-colors">
                                            
                                            {/* Fecha y Referencia */}
                                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 text-center sm:text-left min-w-[120px]">
                                                <div className="text-sm font-bold text-gray-800">{parto.Fec_inicio}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Ciclo Ref: <span className="font-semibold text-gray-600">#{parto.Id_Reproduccion || '—'}</span>
                                                </div>
                                            </div>

                                            {/* Estadísticas */}
                                            <div className="flex-grow w-full">
                                                <div className="grid grid-cols-4 gap-2">
                                                    <div className="bg-green-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-green-600 font-bold mb-1">Vivos</div>
                                                        <div className="text-lg font-black text-green-700">{parto.Nac_vivos}</div>
                                                    </div>
                                                    <div className="bg-red-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-red-600 font-bold mb-1">Muertos</div>
                                                        <div className="text-lg font-black text-red-700">{parto.Nac_muertos}</div>
                                                    </div>
                                                    <div className="bg-yellow-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-yellow-700 font-bold mb-1">Momias</div>
                                                        <div className="text-lg font-black text-yellow-700">{parto.Nac_momias}</div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-gray-500 font-bold mb-1">Peso (kg)</div>
                                                        <div className="text-lg font-black text-gray-700">{parto.Pes_camada}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
