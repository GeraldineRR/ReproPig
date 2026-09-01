import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../api/axiosConfig"

export default function PerfilCerda() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [porcino, setPorcino] = useState(null)
    const [ciclos, setCiclos] = useState([])
    const [partos, setPartos] = useState([])
    const [novedades, setNovedades] = useState([])
    const [responsables, setResponsables] = useState([])
    const [loading, setLoading] = useState(true)
    const [cicloSeleccionado, setCicloSeleccionado] = useState(null)
    const [tabModal, setTabModal] = useState('todas') // 'todas', 'montas', 'inseminaciones'

    useEffect(() => {
        cargarDatos()
    }, [id])

    const cargarDatos = async () => {
        try {
            setLoading(true)
            
            // Traer datos principales de la cerda
            const resPorcino = await apiAxios.get(`/porcino/${id}`)
            setPorcino(resPorcino.data)

            // Traer ciclos
            const resRepro = await apiAxios.get('/ciclos/')
            const reprosDeCerda = resRepro.data.filter(r => r.Id_Cerda == id)
            setCiclos(reprosDeCerda)

            // Traer partos
            const resPartos = await apiAxios.get('/partos/')
            const partosDeCerda = resPartos.data.filter(p => p.Id_Porcino == id)
            setPartos(partosDeCerda)

            // Traer novedades
            const resNovedades = await apiAxios.get('/novedades/')
            const novedadesDeCerda = resNovedades.data.filter(n => n.Id_Porcino == id)
            setNovedades(novedadesDeCerda)

            // Traer responsables
            try {
                const resResp = await apiAxios.get('/responsables/')
                setResponsables(resResp.data)
            } catch (errResp) {
                console.error("Error al cargar responsables:", errResp)
            }

        } catch (error) {
            console.error("Error al cargar perfil:", error)
        } finally {
            setLoading(false)
        }
    }

    const getNombresResponsables = (Id_Responsable) => {
        if (!Id_Responsable || !responsables || responsables.length === 0) return '—'
        try {
            let ids = []
            if (typeof Id_Responsable === 'string' && Id_Responsable.startsWith('[')) {
                ids = JSON.parse(Id_Responsable).map(Number)
            } else if (Array.isArray(Id_Responsable)) {
                ids = Id_Responsable.map(Number)
            } else {
                ids = [Number(Id_Responsable)]
            }
            return ids.map(id => {
                const r = responsables.find(r => r.Id_Responsable === id)
                return r ? `${r.Nombres} ${r.Apellidos}` : `#${id}`
            }).join(', ')
        } catch { return String(Id_Responsable) }
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
                                    {ciclos.length} Total
                                </span>
                            </div>

                            {ciclos.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No hay ciclos registradas para esta cerda.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                    {ciclos.map((repro) => {
                                        const esActivo = (repro.Estado || repro.Activo || '').toUpperCase() === 'ACTIVO' || repro.Activo === 'S';
                                        const numMontas = repro.montas?.length || 0;
                                        const numInsem = repro.inseminaciones?.length || 0;

                                        return (
                                            <div 
                                                key={repro.Id_Ciclo} 
                                                onClick={() => { setCicloSeleccionado(repro); setTabModal('todas'); }}
                                                className="border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-pink-300 transition-all bg-white relative overflow-hidden group cursor-pointer"
                                            >
                                                {/* Indicador de estado */}
                                                <div className={`absolute top-0 left-0 w-1.5 h-full ${esActivo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                
                                                <div className="flex justify-between items-start mb-4 pl-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ciclo #{repro.Id_Ciclo}</span>
                                                        <h4 className="text-lg font-bold text-gray-800 mt-0.5">{repro.TipoCiclo || 'Servicio'}</h4>
                                                    </div>
                                                    {esActivo ? 
                                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Activo
                                                        </span> 
                                                        : 
                                                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">Cerrado</span>
                                                    }
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 pl-2">
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); setCicloSeleccionado(repro); setTabModal('montas'); }}
                                                        className="text-center hover:bg-amber-100/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                                        title="Ver detalle de montas"
                                                    >
                                                        <p className="text-xs text-amber-700 font-bold uppercase mb-1">🐷 Montas</p>
                                                        <p className="text-xl font-black text-amber-900">{numMontas}</p>
                                                    </div>
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); setCicloSeleccionado(repro); setTabModal('inseminaciones'); }}
                                                        className="text-center border-l border-gray-200 hover:bg-blue-100/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                                        title="Ver detalle de inseminaciones"
                                                    >
                                                        <p className="text-xs text-blue-700 font-bold uppercase mb-1">💉 Insem.</p>
                                                        <p className="text-xl font-black text-blue-900">{numInsem}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 text-center pl-2">
                                                    <span className="inline-flex items-center text-xs font-bold text-pink-600 group-hover:text-pink-700 group-hover:underline">
                                                        <i className="fa-solid fa-eye mr-1.5"></i> Ver toda la información del ciclo
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                                    Ciclo Ref: <span className="font-semibold text-gray-600">#{parto.Id_Ciclo || '—'}</span>
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
                                            
                                            <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 flex justify-center">
                                                <button onClick={() => navigate(`/actividades_camada/parto/${parto.Id_parto}`)} className="text-pink-500 hover:bg-pink-50 p-2 rounded-xl transition-colors" title="Ver Seguimiento de Camada">
                                                    <i className="fa-solid fa-list-check"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Historial de Novedades */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    Registro de Novedades
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {novedades.length} Total
                                </span>
                            </div>

                            {novedades.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No hay novedades registradas para este porcino.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {novedades.map(nov => {
                                        let bgClass = 'bg-gray-50';
                                        let textClass = 'text-gray-700';
                                        let icon = 'fa-circle-info';
                                        
                                        if (nov.Tipo_Novedad === 'Muerte' || nov.Tipo_Novedad === 'Descarte') {
                                            bgClass = 'bg-red-50'; textClass = 'text-red-700'; icon = 'fa-skull';
                                        } else if (nov.Tipo_Novedad === 'Enfermedad' || nov.Tipo_Novedad === 'Lesión') {
                                            bgClass = 'bg-yellow-50'; textClass = 'text-yellow-700'; icon = 'fa-briefcase-medical';
                                        } else if (nov.Tipo_Novedad === 'Traslado') {
                                            bgClass = 'bg-blue-50'; textClass = 'text-blue-700'; icon = 'fa-truck-fast';
                                        }

                                        return (
                                            <div key={nov.Id_Novedad} className={`flex items-start ${bgClass} border border-gray-100 shadow-sm rounded-2xl p-4`}>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${textClass} bg-white mr-4 shadow-sm`}>
                                                    <i className={`fa-solid ${icon}`}></i>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`font-bold ${textClass}`}>{nov.Tipo_Novedad}</h4>
                                                        <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                                                            {nov.Fecha_Novedad?.split('T')[0]?.split('-').reverse().join('/')}
                                                        </span>
                                                    </div>
                                                    {nov.Causa_Motivo && (
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">Causa: {nov.Causa_Motivo}</p>
                                                    )}
                                                    {nov.Observaciones && (
                                                        <p className="text-sm text-gray-600 italic">"{nov.Observaciones}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* MODAL DETALLE DE CICLO REPRODUCTIVO */}
            {cicloSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        Ciclo #{cicloSeleccionado.Id_Ciclo}
                                    </span>
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                        (cicloSeleccionado.Estado || cicloSeleccionado.Activo || '').toUpperCase() === 'ACTIVO' || cicloSeleccionado.Activo === 'S'
                                            ? 'bg-green-500/30 text-green-300 border border-green-500/40' 
                                            : 'bg-gray-500/30 text-gray-300 border border-gray-500/40'
                                    }`}>
                                        {(cicloSeleccionado.Estado || cicloSeleccionado.Activo || '').toUpperCase() === 'ACTIVO' || cicloSeleccionado.Activo === 'S' ? 'Activo' : 'Cerrado'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight">
                                    {cicloSeleccionado.TipoCiclo || 'Ciclo Reproductivo'}
                                </h3>
                                <p className="text-xs text-gray-300 mt-1">
                                    Cerda: <strong className="text-white">{porcino.Nom_Porcino}</strong> (Chapeta: {porcino.Num_Chapeta})
                                </p>
                            </div>
                            <button 
                                onClick={() => setCicloSeleccionado(null)}
                                className="text-gray-400 hover:text-white hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        {/* Selector de pestañas */}
                        <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-3 gap-2">
                            <button 
                                onClick={() => setTabModal('todas')}
                                className={`pb-3 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
                                    tabModal === 'todas' 
                                        ? 'border-pink-600 text-pink-600 bg-white shadow-sm' 
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}>
                                Todos los registros ({(cicloSeleccionado.montas?.length || 0) + (cicloSeleccionado.inseminaciones?.length || 0)})
                            </button>
                            <button 
                                onClick={() => setTabModal('montas')}
                                className={`pb-3 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
                                    tabModal === 'montas' 
                                        ? 'border-amber-600 text-amber-600 bg-white shadow-sm' 
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}>
                                🐷 Montas Naturales ({cicloSeleccionado.montas?.length || 0})
                            </button>
                            <button 
                                onClick={() => setTabModal('inseminaciones')}
                                className={`pb-3 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
                                    tabModal === 'inseminaciones' 
                                        ? 'border-blue-600 text-blue-600 bg-white shadow-sm' 
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}>
                                💉 Inseminaciones ({cicloSeleccionado.inseminaciones?.length || 0})
                            </button>
                        </div>

                        {/* Modal Body / Scroll area */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                            {/* SECCIÓN MONTAS */}
                            {(tabModal === 'todas' || tabModal === 'montas') && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-amber-800 flex items-center uppercase tracking-wide">
                                            <i className="fa-solid fa-piggy-bank mr-2 text-amber-600"></i>
                                            Montas Naturales ({cicloSeleccionado.montas?.length || 0})
                                        </h4>
                                    </div>

                                    {(!cicloSeleccionado.montas || cicloSeleccionado.montas.length === 0) ? (
                                        <div className="text-center py-6 bg-amber-50/40 rounded-2xl border border-dashed border-amber-200/60">
                                            <p className="text-xs text-amber-700/70 font-medium">No se registraron montas naturales en este ciclo.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {cicloSeleccionado.montas.map((monta) => (
                                                <div key={`m-${monta.Id_Monta}`} className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-200/50">
                                                        <span className="font-bold text-amber-950 text-sm flex items-center">
                                                            Monta #{monta.Id_Monta}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                                                                <i className="fa-regular fa-clock mr-1 text-amber-600"></i>
                                                                {monta.Fec_hora ? new Date(monta.Fec_hora).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'Fecha no especificada'}
                                                            </span>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                                (monta.Estado || '').toLowerCase() === 'inactivo' || monta.Estado === 'I' 
                                                                    ? 'bg-red-100 text-red-700' 
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {monta.Estado || 'Activo'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                                        <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Cerdo / Verraco</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-sm">
                                                                <i className="fa-solid fa-mars text-blue-500 mr-1.5"></i>
                                                                {monta.cerdo?.Nom_Porcino || (monta.Id_Cerdo ? `Cerdo #${monta.Id_Cerdo}` : 'Sin datos')}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Responsable(s)</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-xs">
                                                                <i className="fa-solid fa-user-gear text-gray-400 mr-1.5"></i>
                                                                {getNombresResponsables(monta.Id_Responsable)}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Ciclo Vinculado</span>
                                                            <span className="font-bold text-gray-800 mt-1 block text-xs">Ciclo #{monta.Id_Ciclo}</span>
                                                        </div>
                                                    </div>

                                                    {monta.Observaciones && (
                                                        <div className="mt-3 pt-2 border-t border-amber-200/50 text-xs text-gray-700 bg-white/70 p-2.5 rounded-xl">
                                                            <strong className="text-amber-900">Observaciones:</strong> <span className="italic">"{monta.Observaciones}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SECCIÓN INSEMINACIONES */}
                            {(tabModal === 'todas' || tabModal === 'inseminaciones') && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-blue-800 flex items-center uppercase tracking-wide">
                                            <i className="fa-solid fa-syringe mr-2 text-blue-600"></i>
                                            Inseminaciones Artificiales ({cicloSeleccionado.inseminaciones?.length || 0})
                                        </h4>
                                    </div>

                                    {(!cicloSeleccionado.inseminaciones || cicloSeleccionado.inseminaciones.length === 0) ? (
                                        <div className="text-center py-6 bg-blue-50/40 rounded-2xl border border-dashed border-blue-200/60">
                                            <p className="text-xs text-blue-700/70 font-medium">No se registraron inseminaciones artificiales en este ciclo.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {cicloSeleccionado.inseminaciones.map((insem) => (
                                                <div key={`i-${insem.Id_Inseminacion}`} className="bg-blue-50/50 border border-blue-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-blue-200/50">
                                                        <span className="font-bold text-blue-950 text-sm flex items-center">
                                                            Inseminación #{insem.Id_Inseminacion}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                                                                <i className="fa-regular fa-clock mr-1 text-blue-600"></i>
                                                                {insem.Fec_hora ? new Date(insem.Fec_hora).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'Fecha no especificada'}
                                                            </span>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                                (insem.Estado || '').toLowerCase() === 'inactivo' || insem.Estado === 'I' 
                                                                    ? 'bg-red-100 text-red-700' 
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {insem.Estado || 'Activo'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                                        <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Cantidad Dosis</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-sm">
                                                                <i className="fa-solid fa-vial text-blue-500 mr-1.5"></i>
                                                                {insem.cantidad || 1} pajilla(s)
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Colecta de Origen</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-xs">
                                                                <i className="fa-solid fa-flask text-teal-600 mr-1.5"></i>
                                                                {insem.Id_colecta ? (
                                                                    <span>
                                                                        Colecta #{insem.Id_colecta}
                                                                        {insem.colecta?.porcino?.Nom_Porcino && (
                                                                            <span className="text-gray-500 font-semibold ml-1">({insem.colecta.porcino.Nom_Porcino})</span>
                                                                        )}
                                                                    </span>
                                                                ) : 'Sin colecta vinculada'}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Responsable(s)</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-xs">
                                                                <i className="fa-solid fa-user-gear text-gray-400 mr-1.5"></i>
                                                                {getNombresResponsables(insem.Id_Responsable)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {insem.Observaciones && (
                                                        <div className="mt-3 pt-2 border-t border-blue-200/50 text-xs text-gray-700 bg-white/70 p-2.5 rounded-xl">
                                                            <strong className="text-blue-900">Observaciones:</strong> <span className="italic">"{insem.Observaciones}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 border-t border-gray-100 p-4 px-6 flex justify-end">
                            <button 
                                onClick={() => setCicloSeleccionado(null)}
                                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

