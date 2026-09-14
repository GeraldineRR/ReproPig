import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../api/axiosConfig"

const toSortKey = (dateStr) => {
    if (!dateStr) return "0000-00-00T00:00:00.000Z"
    try { return new Date(dateStr).toISOString() } catch (e) { return "0000-00-00T00:00:00.000Z" }
}

const fmtFecha = (dateStr) => {
    if (!dateStr) return "—"
    try { return new Date(dateStr).toLocaleDateString() } catch (e) { return "—" }
}

const fmtFechaHora = (dateStr) => {
    if (!dateStr) return "—"
    try { return new Date(dateStr).toLocaleString() } catch (e) { return "—" }
}

export default function PerfilCerda() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [porcino, setPorcino] = useState(null)
    const [ciclos, setCiclos] = useState([])
    const [partos, setPartos] = useState([])
    const [novedades, setNovedades] = useState([])
    const [seguimientos, setSeguimientos] = useState([])
    const [loading, setLoading] = useState(true)

    const pdfRef = useRef(null)
    const [exportando, setExportando] = useState(false)

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

            // Traer seguimientos (si existe la ruta, o un array vacío si falla)
            try {
                const resSeguimientos = await apiAxios.get('/seguimiento_cerda/')
                const seguimientosDeCerda = resSeguimientos.data.filter(s => s.Id_Cerda == id)
                setSeguimientos(seguimientosDeCerda)
            } catch (e) {
                console.log("No se pudieron cargar seguimientos", e)
            }

        } catch (error) {
            console.error("Error al cargar perfil:", error)
        } finally {
            setLoading(false)
        }
    }


    const montasTodas = useMemo(
        () =>
            ciclos
                .flatMap((c) =>
                    (c.montas || []).map((m) => ({ ...m, Id_Ciclo: c.Id_Ciclo, TipoCiclo: c.TipoCiclo }))
                )
                .sort((a, b) => toSortKey(a.Fec_hora).localeCompare(toSortKey(b.Fec_hora))),
        [ciclos]
    )

    const inseminacionesTodas = useMemo(
        () =>
            ciclos
                .flatMap((c) =>
                    (c.inseminaciones || []).map((m) => ({ ...m, Id_Ciclo: c.Id_Ciclo, TipoCiclo: c.TipoCiclo }))
                )
                .sort((a, b) => toSortKey(a.Fec_hora).localeCompare(toSortKey(b.Fec_hora))),
        [ciclos]
    )

    const historialCronologico = useMemo(() => {
        const events = []

        montasTodas.forEach((m) => {
            events.push({
                sort: toSortKey(m.Fec_hora),
                fecha: fmtFechaHora(m.Fec_hora),
                tipo: "Monta",
                detalle: `Monta natural registrada`,
                ref: `Ciclo #${m.Id_Ciclo}${m.TipoCiclo ? ` · ${m.TipoCiclo}` : ""}`,
            })
        })

        inseminacionesTodas.forEach((ins) => {
            events.push({
                sort: toSortKey(ins.Fec_hora),
                fecha: fmtFechaHora(ins.Fec_hora),
                tipo: "Inseminación",
                detalle: `Inseminación artificial`,
                ref: `Ciclo #${ins.Id_Ciclo}${ins.TipoCiclo ? ` · ${ins.TipoCiclo}` : ""}`,
            })
        })

        partos.forEach((p) => {
            events.push({
                sort: toSortKey(p.Fec_inicio),
                fecha: fmtFecha(p.Fec_inicio),
                tipo: "Parto",
                detalle: `Vivos ${p.Nac_vivos ?? 0} · Muertos ${p.Nac_muertos ?? 0} · Momias ${p.Nac_momias ?? 0} · Peso ${p.Pes_camada ?? "—"} kg`,
                ref: p.Id_Ciclo ? `Ciclo #${p.Id_Ciclo}` : "—",
            })
        })

        seguimientos.forEach((s) => {
            events.push({
                sort: toSortKey(s.Fecha) + (s.Hora ? ` ${String(s.Hora).slice(0, 5)}` : ""),
                fecha: `${fmtFecha(s.Fecha)}${s.Hora ? ` ${String(s.Hora).slice(0, 5)}` : ""}`,
                tipo: "Seguimiento",
                detalle: [s.Observaciones, s.medicamentos?.Nombre ? `Med: ${s.medicamentos.Nombre}` : null, s.Responsables?.Nombres ? `Resp: ${s.Responsables.Nombres}` : null]
                    .filter(Boolean)
                    .join(" · ") || "Seguimiento clínico",
                ref: s.Id_Ciclo ? `Ciclo #${s.Id_Ciclo}` : "—",
            })
        })

        return events.sort((a, b) => a.sort.localeCompare(b.sort))
    }, [montasTodas, inseminacionesTodas, partos, seguimientos])

    const exportarPDF = async () => {
        if (!pdfRef.current || exportando) return
        setExportando(true)
        try {
            const [jsPDFModule, html2canvasModule] = await Promise.all([
                import("jspdf"),
                import("html2canvas"),
            ]);
            const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
            const html2canvas = html2canvasModule.default || html2canvasModule;

            const el = pdfRef.current
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: 1024,
                windowWidth: 1024,
            })

            const pdf = new jsPDF("p", "mm", "a4")
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            const margin = 0 // Usamos 0 porque el HTML ya tiene padding (p-12)
            const usableH = pageH - margin * 2
            const imgW = pageW - margin * 2
            const imgH = (canvas.height * imgW) / canvas.width
            const imgData = canvas.toDataURL("image/jpeg", 0.95)

            let heightLeft = imgH
            let position = margin

            pdf.addImage(imgData, "JPEG", margin, position, imgW, imgH)
            heightLeft -= usableH

            while (heightLeft > 0) {
                position = margin - (imgH - heightLeft)
                pdf.addPage()
                pdf.addImage(imgData, "JPEG", margin, position, imgW, imgH)
                heightLeft -= usableH
            }

            const nombre = (porcino?.Nom_Porcino || "cerda").replace(/\s+/g, "_")
            pdf.save(`Hoja_de_Vida_${nombre}_${porcino?.Num_Chapeta || id}.pdf`)
        } catch (err) {
            console.error("Error exportando PDF:", err)
            window.print()
        } finally {
            setExportando(false)
        }
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
            </div>
        )
    if (!porcino)
        return <div className="p-10 text-center mt-5 text-gray-500 text-xl font-medium">Cerda no encontrada</div>

    // Utils para el PDF y tarjetas
    const cicloActivo = (repro) => repro.Estado === "Activo" || repro.Activo === "S";

    const SectionHeader = ({ num, title }) => (
        <div className="flex items-center bg-gray-900 text-white font-bold py-1 px-3 mt-8 mb-2 rounded-t-sm">
            <div className="bg-white text-gray-900 rounded-sm font-black w-6 h-6 flex items-center justify-center mr-3 text-sm">
                {num}
            </div>
            <h2 className="uppercase tracking-wide text-sm">{title}</h2>
        </div>
    );
    const Td = ({ children, className = "" }) => (
        <td className={`border-b border-x border-gray-200 px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
    );
    const Th = ({ children, className = "" }) => (
        <th className={`border-b border-x border-gray-200 px-4 py-3 text-xs font-bold text-gray-800 bg-gray-50 uppercase tracking-wider text-left ${className}`}>{children}</th>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 relative overflow-hidden overflow-x-hidden">
            {/* Header / Top Bar */}
            <div className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-pink-600 transition-colors font-medium">
                    <i className="fa-solid fa-arrow-left mr-2"></i> Volver a Porcinos
                </button>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-400 font-medium hidden sm:block">Perfil Clínico y Reproductivo</div>
                    <button 
                        onClick={exportarPDF} 
                        disabled={exportando}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow font-medium text-sm transition-colors flex items-center disabled:opacity-50"
                    >
                        <i className={`fa-solid ${exportando ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>
                        {exportando ? 'Exportando...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>

            {/* VISTA EN PANTALLA (TARJETAS BONITAS ORIGINALES) */}
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
                                    {porcino.raza?.Nom_Raza || porcino.razas?.Nom_Raza || 'Sin raza definida'}
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
                                    {ciclos.map((repro) => (
                                        <div key={repro.Id_Ciclo} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-gray-50/50 relative overflow-hidden group">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${cicloActivo(repro) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ciclo #{repro.Id_Ciclo}</span>
                                                    <h4 className="text-lg font-bold text-gray-800 mt-1">{repro.TipoCiclo}</h4>
                                                </div>
                                                {cicloActivo(repro) ? 
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

            {/* VISTA PARA EXPORTAR A PDF (OCULTA EN PANTALLA) */}
            <div style={{ position: 'fixed', left: '200vw', top: '0', width: '1024px', zIndex: -1000 }}>
                <div ref={pdfRef} className="bg-white p-12 w-full font-sans">
                    
                    {/* ENCABEZADO */}
                    <div className="flex justify-between items-end border-b-[3px] border-pink-700 pb-5 mb-8">
                        <div>
                            <div className="text-pink-700 font-bold tracking-widest text-sm mb-2 uppercase flex items-center">
                                Repropig <span className="mx-2 text-gray-300">·</span> Unidad Porcina
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Hoja de vida reproductiva</h1>
                            <p className="text-gray-500 font-medium mt-2">Historial clínico y de producción</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Fecha de emisión</div>
                            <div className="font-bold text-gray-800 text-lg">{new Date().toLocaleDateString('es-CO')}</div>
                            <div className="text-sm text-gray-500 mt-2 font-medium">ID animal: {porcino.Id_Porcino}</div>
                        </div>
                    </div>

                    {/* 1 IDENTIFICACIÓN DEL ANIMAL */}
                    <SectionHeader num="1" title="Identificación del Animal" />
                    <table className="w-full border-collapse mb-8 border border-gray-200">
                        <tbody>
                            <tr>
                                <td className="border border-pink-100 bg-pink-50/60 px-6 py-4 w-1/2">
                                    <div className="text-xs font-black text-pink-700 uppercase mb-1 tracking-wider">Nombre</div>
                                    <div className="text-3xl font-black text-gray-900">{porcino.Nom_Porcino}</div>
                                </td>
                                <td className="border border-pink-100 bg-pink-50/60 px-6 py-4 w-1/2">
                                    <div className="text-xs font-black text-pink-700 uppercase mb-1 tracking-wider">Chapeta</div>
                                    <div className="text-3xl font-black text-gray-900">{porcino.Num_Chapeta}</div>
                                </td>
                            </tr>
                            <tr>
                                <Td><strong>Raza:</strong> {porcino.raza?.Nom_Raza || porcino.razas?.Nom_Raza || '—'}</Td>
                                <Td><strong>Placa SENA:</strong> {porcino.Plac_Sena_Porcino}</Td>
                            </tr>
                            <tr>
                                <Td><strong>Nacimiento:</strong> {fmtFecha(porcino.Fec_Nac_Porcino)}</Td>
                                <Td><strong>Llegada:</strong> {fmtFecha(porcino.Fec_Llegada)}</Td>
                            </tr>
                            <tr>
                                <Td><strong>Peso Inicial:</strong> {porcino.Peso_Llegada} kg</Td>
                                <Td><strong>Origen:</strong> {porcino.Proc_Porcino} · {porcino.Lug_Proc_Porcino}</Td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 2 RESUMEN DE REGISTROS */}
                    <SectionHeader num="2" title="Resumen de Registros" />
                    <table className="w-full border-collapse text-center mb-8 border border-gray-900">
                        <thead>
                            <tr className="bg-gray-900 text-white text-xs uppercase tracking-wider">
                                <th className="py-3 px-2 border-r border-gray-700">Ciclos</th>
                                <th className="py-3 px-2 border-r border-gray-700">Montas</th>
                                <th className="py-3 px-2 border-r border-gray-700">Insem.</th>
                                <th className="py-3 px-2 border-r border-gray-700">Partos</th>
                                <th className="py-3 px-2 border-r border-gray-700">Seguim.</th>
                                <th className="py-3 px-2">Novedades</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-r border-b border-gray-200 py-4 text-3xl font-black text-gray-900">{ciclos.length}</td>
                                <td className="border-r border-b border-gray-200 py-4 text-3xl font-black text-gray-900">{ciclos.reduce((acc, c) => acc + (c.montas?.length || 0), 0)}</td>
                                <td className="border-r border-b border-gray-200 py-4 text-3xl font-black text-gray-900">{ciclos.reduce((acc, c) => acc + (c.inseminaciones?.length || 0), 0)}</td>
                                <td className="border-r border-b border-gray-200 py-4 text-3xl font-black text-gray-900">{partos.length}</td>
                                <td className="border-r border-b border-gray-200 py-4 text-3xl font-black text-gray-900">{seguimientos.length}</td>
                                <td className="border-b border-gray-200 py-4 text-3xl font-black text-gray-900">{novedades.length}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 3 GRÁFICO DE HISTORIAL DE PARTOS */}
                    <SectionHeader num="3" title="Gráfico de Historial de Partos" />
                    <div className="border border-gray-200 bg-gray-50/40 p-8 mb-8 flex justify-center">
                        {partos.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 font-medium">No hay partos registrados para graficar.</div>
                        ) : (
                            <div className="w-full max-w-2xl">
                                <div className="relative h-64 border-b-2 border-l-2 border-gray-300 flex items-end justify-around pb-0 pt-4 px-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-full flex flex-col justify-between pointer-events-none">
                                        {[15, 12, 9, 6, 3, 0].map(val => (
                                            <div key={val} className="w-full border-t border-gray-200 flex items-center relative">
                                                <span className="absolute -left-8 text-xs text-gray-500 font-medium bg-gray-50 pr-2">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {partos.slice().sort((a,b)=>toSortKey(a.Fec_inicio).localeCompare(toSortKey(b.Fec_inicio))).map((p, idx) => {
                                        const calcH = (val) => Math.min((val || 0) * (100/15), 100);
                                        return (
                                            <div key={idx} className="relative flex items-end justify-center group z-10 w-24 h-full">
                                                <div className="w-6 bg-green-700 mx-1" style={{ height: `${calcH(p.Nac_vivos)}%` }}></div>
                                                <div className="w-6 bg-red-600 mx-1" style={{ height: `${calcH(p.Nac_muertos)}%` }}></div>
                                                <div className="w-6 bg-amber-700 mx-1" style={{ height: `${calcH(p.Nac_momias)}%` }}></div>
                                                <span className="absolute -bottom-8 text-xs text-gray-700 font-medium whitespace-nowrap">{fmtFecha(p.Fec_inicio)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-center mt-12 space-x-8">
                                    <div className="flex items-center text-sm font-semibold text-gray-700"><span className="w-4 h-4 bg-green-700 inline-block mr-2 rounded-sm shadow-sm"></span> Vivos</div>
                                    <div className="flex items-center text-sm font-semibold text-gray-700"><span className="w-4 h-4 bg-red-600 inline-block mr-2 rounded-sm shadow-sm"></span> Muertos</div>
                                    <div className="flex items-center text-sm font-semibold text-gray-700"><span className="w-4 h-4 bg-amber-700 inline-block mr-2 rounded-sm shadow-sm"></span> Momias</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4 HISTORIAL CRONOLÓGICO */}
                    <SectionHeader num="4" title="Historial Cronológico (Todas las Actividades)" />
                    <table className="w-full border-collapse mb-8 border border-gray-200">
                        <thead>
                            <tr>
                                <Th className="w-1/4">FECHA</Th>
                                <Th className="w-1/5">TIPO</Th>
                                <Th className="w-2/5">DETALLE</Th>
                                <Th>REFERENCIA</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {historialCronologico.length === 0 ? (
                                <tr><Td colSpan="4" className="text-center italic text-gray-500 py-6">Sin actividades registradas.</Td></tr>
                            ) : (
                                historialCronologico.map((ev, i) => (
                                    <tr key={i}>
                                        <Td>{ev.fecha}</Td>
                                        <Td><span className="font-semibold">{ev.tipo}</span></Td>
                                        <Td>{ev.detalle}</Td>
                                        <Td>{ev.ref}</Td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* 5 CICLOS REPRODUCTIVOS */}
                    <SectionHeader num="5" title="Ciclos Reproductivos" />
                    <table className="w-full border-collapse mb-8 border border-gray-200">
                        <thead>
                            <tr>
                                <Th>ID</Th>
                                <Th>TIPO</Th>
                                <Th>ESTADO</Th>
                                <Th>MONTAS</Th>
                                <Th>INSEMINACIONES</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {ciclos.length === 0 ? (
                                <tr><Td colSpan="5" className="text-center italic text-gray-500 py-6">Sin ciclos registrados.</Td></tr>
                            ) : (
                                ciclos.map((c) => (
                                    <tr key={c.Id_Ciclo}>
                                        <Td>#{c.Id_Ciclo}</Td>
                                        <Td>{c.TipoCiclo}</Td>
                                        <Td>{c.Estado}</Td>
                                        <Td>{c.montas?.length || 0}</Td>
                                        <Td>{c.inseminaciones?.length || 0}</Td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* 6 MONTAS E INSEMINACIONES */}
                    <SectionHeader num="6" title="Montas e Inseminaciones" />
                    <div className="mb-8 border border-gray-200 p-1">
                        <div className="bg-pink-50 text-pink-800 font-bold px-4 py-2 border-b border-gray-200">Montas</div>
                        {montasTodas.length === 0 ? (
                            <p className="text-sm italic text-gray-500 p-4 border-b border-gray-200">Sin montas.</p>
                        ) : (
                            <table className="w-full border-collapse border-b border-gray-200">
                                <thead>
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>FECHA / HORA</Th>
                                        <Th>CICLO</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {montasTodas.map((m, i) => (
                                        <tr key={i}>
                                            <Td>#{m.Id_Monta || m.id || i}</Td>
                                            <Td>{fmtFechaHora(m.Fec_hora)}</Td>
                                            <Td>#{m.Id_Ciclo} ({m.TipoCiclo})</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="bg-teal-50 text-teal-800 font-bold px-4 py-2 border-b border-gray-200">Inseminaciones</div>
                        {inseminacionesTodas.length === 0 ? (
                            <p className="text-sm italic text-gray-500 p-4">Sin inseminaciones.</p>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>FECHA / HORA</Th>
                                        <Th>CICLO</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inseminacionesTodas.map((m, i) => (
                                        <tr key={i}>
                                            <Td>#{m.Id_Inseminacion || m.id || i}</Td>
                                            <Td>{fmtFechaHora(m.Fec_hora)}</Td>
                                            <Td>#{m.Id_Ciclo} ({m.TipoCiclo})</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* 7 HISTORIAL DE PARTOS */}
                    <SectionHeader num="7" title="Historial de Partos" />
                    <table className="w-full border-collapse mb-8 border border-gray-200">
                        <thead>
                            <tr>
                                <Th>FECHA</Th>
                                <Th>CICLO</Th>
                                <Th>VIVOS</Th>
                                <Th>MUERTOS</Th>
                                <Th>MOMIAS</Th>
                                <Th>PESO (KG)</Th>
                                <Th>OBSERVACIONES</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {partos.length === 0 ? (
                                <tr><Td colSpan="7" className="text-center italic text-gray-500 py-6">Sin partos registrados.</Td></tr>
                            ) : (
                                partos.map((p) => (
                                    <tr key={p.Id_parto}>
                                        <Td>{fmtFecha(p.Fec_inicio)}</Td>
                                        <Td>#{p.Id_Ciclo}</Td>
                                        <Td>{p.Nac_vivos}</Td>
                                        <Td>{p.Nac_muertos}</Td>
                                        <Td>{p.Nac_momias}</Td>
                                        <Td>{p.Pes_camada}</Td>
                                        <Td className="italic">{p.Observaciones || '—'}</Td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* 8 SEGUIMIENTO DE CERDA */}
                    <SectionHeader num="8" title="Seguimiento de Cerda" />
                    {seguimientos.length === 0 ? (
                        <p className="text-sm italic text-gray-500 mb-8 px-4">Sin seguimientos.</p>
                    ) : (
                        <table className="w-full border-collapse mb-8 border border-gray-200">
                            <thead>
                                <tr>
                                    <Th>FECHA</Th>
                                    <Th>CICLO</Th>
                                    <Th>RESPONSABLE</Th>
                                    <Th>MEDICAMENTO</Th>
                                    <Th>OBSERVACIONES</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {seguimientos.map((s) => (
                                    <tr key={s.Id_Seguimiento_Cerda}>
                                        <Td>{fmtFecha(s.Fecha)} {s.Hora ? s.Hora.slice(0,5) : ''}</Td>
                                        <Td>{s.Id_Ciclo ? `#${s.Id_Ciclo}` : '—'}</Td>
                                        <Td>{s.Responsables?.Nombres || '—'}</Td>
                                        <Td>{s.medicamentos?.Nombre || '—'}</Td>
                                        <Td className="italic">{s.Observaciones || '—'}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 9 NOVEDADES */}
                    <SectionHeader num="9" title="Novedades" />
                    {novedades.length === 0 ? (
                        <p className="text-sm italic text-gray-500 mb-8 px-4">Sin novedades.</p>
                    ) : (
                        <table className="w-full border-collapse mb-8 border border-gray-200">
                            <thead>
                                <tr>
                                    <Th>FECHA</Th>
                                    <Th>TIPO</Th>
                                    <Th>CAUSA / MOTIVO</Th>
                                    <Th>OBSERVACIONES</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {novedades.map((n) => (
                                    <tr key={n.Id_Novedad}>
                                        <Td>{fmtFecha(n.Fecha_Novedad)}</Td>
                                        <Td><span className="font-semibold">{n.Tipo_Novedad}</span></Td>
                                        <Td>{n.Causa_Motivo || '—'}</Td>
                                        <Td className="italic">{n.Observaciones || '—'}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* FOOTER */}
                    <div className="mt-16 pt-6 border-t border-gray-300 flex justify-between items-center text-xs text-gray-400 font-medium">
                        <div>Documento generado automáticamente por ReproPig</div>
                        <div>{porcino.Nom_Porcino} · Chapeta {porcino.Num_Chapeta}</div>
                    </div>

                </div>
            </div>
        </div>
    )
}
