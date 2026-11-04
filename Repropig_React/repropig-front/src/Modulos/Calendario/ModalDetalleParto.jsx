import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"

const ModalDetalleParto = ({ isOpen, onClose, idCiclo }) => {
    const [loading, setLoading] = useState(false)
    const [parto, setParto] = useState(null)
    const [error, setError] = useState(null)
    const [responsables, setResponsables] = useState([])

    useEffect(() => {
        if (isOpen && idCiclo) {
            cargarDetalleParto()
            cargarResponsables()
        } else {
            setParto(null)
            setError(null)
        }
    }, [isOpen, idCiclo])

    const cargarDetalleParto = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await apiAxios.get(`/partos/ciclo/${idCiclo}`)
            setParto(res.data)
        } catch (err) {
            console.error("Error al cargar parto del ciclo:", err)
            setError(err.response?.data?.message || "No se encontró registro de parto para este ciclo")
        } finally {
            setLoading(false)
        }
    }

    const cargarResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error("Error al cargar responsables:", err)
        }
    }

    const parsearResponsables = (valor) => {
        if (!valor) return []
        if (Array.isArray(valor)) return valor.map(Number)
        if (typeof valor === 'string' && valor.startsWith('[')) {
            try { return JSON.parse(valor).map(Number) } catch { return [] }
        }
        const num = Number(valor)
        return isNaN(num) ? [] : [num]
    }

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "---"
        const clean = String(fechaStr).split("T")[0]
        const partes = clean.split("-")
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`
        }
        return clean
    }

    const formatearHora = (horaStr) => {
        if (!horaStr) return "---"
        return String(horaStr).slice(0, 5)
    }

    if (!isOpen) return null

    const respIds = parsearResponsables(parto?.Id_Responsable)
    const respNombres = respIds.map(id => {
        const r = responsables.find(resp => Number(resp.Id_Responsable) === Number(id))
        return r ? `${r.Nombres} ${r.Apellidos || ''}`.trim() : `Responsable #${id}`
    })

    const nacVivos = Number(parto?.Nac_vivos || 0)
    const nacMuertos = Number(parto?.Nac_muertos || 0)
    const nacMomias = Number(parto?.Nac_momias || 0)
    const totalNacidos = parto ? (nacVivos + nacMuertos + nacMomias) : 0
    const pesoCamadaNum = parto?.Pes_camada ? Number(parto.Pes_camada) : null
    const pesoPromedioLechon = (pesoCamadaNum && nacVivos > 0)
        ? (pesoCamadaNum / nacVivos).toFixed(2)
        : null

    const tasaSupervivencia = totalNacidos > 0
        ? Math.round((nacVivos / totalNacidos) * 100)
        : 0

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem 1rem',
                overflow: 'hidden'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    width: '100%',
                    maxWidth: '860px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Fijo (Nunca se recorta) */}
                <div
                    style={{
                        flexShrink: 0,
                        padding: '1.1rem 1.75rem',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid rgba(34, 197, 94, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}
                        >
                            🐖
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.3px' }}>
                                    Detalle del Parto Registrado
                                </h4>
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill" style={{ fontSize: '11px', fontWeight: 600 }}>
                                    Completado
                                </span>
                            </div>
                            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                Ciclo Reproductivo #{idCiclo} • Ficha Oficial de Maternidad
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        title="Cerrar modal"
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        ✕
                    </button>
                </div>

                {/* Body con Scroll Interno Suave */}
                <div
                    style={{
                        flex: '1 1 auto',
                        minHeight: 0,
                        overflowY: 'auto',
                        padding: '1.5rem 1.75rem'
                    }}
                >
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="text-muted mt-3 fw-semibold">Consultando registro del parto en la base de datos...</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-warning py-4 px-4 d-flex align-items-center gap-3 rounded-4 shadow-sm">
                            <span style={{ fontSize: '2rem' }}>⚠️</span>
                            <div>
                                <h6 className="fw-bold mb-1 text-dark">Información no disponible</h6>
                                <p className="mb-0 text-secondary small">{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && parto && (
                        <div className="d-flex flex-column gap-4">

                            {/* Hero Card: Madre y Ciclo */}
                            <div
                                style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '16px',
                                    padding: '1.25rem 1.5rem',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                                }}
                            >
                                <div className="row align-items-center g-3">
                                    <div className="col-md-6 border-end-md">
                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                            🐷 Cerda Reproductora (Madre)
                                        </small>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fs-5 fw-bold text-dark">
                                                {parto.porcino?.Nom_Porcino || `Cerda #${parto.Id_Porcino}`}
                                            </span>
                                            {parto.porcino?.Num_Chapeta && (
                                                <span className="badge bg-dark px-2.5 py-1 rounded-pill" style={{ fontSize: '12px' }}>
                                                    Chapeta: {parto.porcino.Num_Chapeta}
                                                </span>
                                            )}
                                            {parto.porcino?.raza?.Nom_Raza && (
                                                <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill" style={{ fontSize: '11px' }}>
                                                    {parto.porcino.raza.Nom_Raza}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                            🔄 Ciclo Reproductivo Vinculado
                                        </small>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-bold text-secondary fs-6">
                                                Ciclo #{parto.Id_Ciclo}
                                            </span>
                                            {parto.ciclo?.TipoCiclo && (
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill" style={{ fontSize: '11px' }}>
                                                    {parto.ciclo.TipoCiclo}
                                                </span>
                                            )}
                                            <span className="badge bg-success px-2.5 py-1 rounded-pill" style={{ fontSize: '11px' }}>
                                                Estado: {parto.ciclo?.Estado || 'Finalizado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Balance de Nacimientos (KPI Cards Espaciosas) */}
                            <div>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                                        <span>📊</span> Balance General de la Camada
                                    </h6>
                                    {totalNacidos > 0 && (
                                        <span className="small text-muted fw-semibold">
                                            Tasa de viabilidad: <strong className="text-success">{tasaSupervivencia}%</strong>
                                        </span>
                                    )}
                                </div>
                                <div className="row g-3 text-center">
                                    {/* Total */}
                                    <div className="col-sm-3 col-6">
                                        <div
                                            style={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '14px',
                                                padding: '1.25rem 0.75rem',
                                                border: '2px solid #e2e8f0',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>🐖</span>
                                            <small className="text-muted fw-bold d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                                Total Nacidos
                                            </small>
                                            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                                                {totalNacidos}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Vivos */}
                                    <div className="col-sm-3 col-6">
                                        <div
                                            style={{
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '14px',
                                                padding: '1.25rem 0.75rem',
                                                border: '2px solid #86efac',
                                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.08)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>💚</span>
                                            <small className="text-success fw-bold d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                                Nacidos Vivos
                                            </small>
                                            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#15803d', lineHeight: 1.2 }}>
                                                {nacVivos}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Muertos */}
                                    <div className="col-sm-3 col-6">
                                        <div
                                            style={{
                                                backgroundColor: '#fef2f2',
                                                borderRadius: '14px',
                                                padding: '1.25rem 0.75rem',
                                                border: '2px solid #fca5a5',
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>☠️</span>
                                            <small className="text-danger fw-bold d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                                Nacidos Muertos
                                            </small>
                                            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#b91c1c', lineHeight: 1.2 }}>
                                                {nacMuertos}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Momias */}
                                    <div className="col-sm-3 col-6">
                                        <div
                                            style={{
                                                backgroundColor: '#fffbeb',
                                                borderRadius: '14px',
                                                padding: '1.25rem 0.75rem',
                                                border: '2px solid #fde047',
                                                boxShadow: '0 4px 12px rgba(234, 179, 8, 0.08)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>🪨</span>
                                            <small className="text-warning-emphasis fw-bold d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                                Momias
                                            </small>
                                            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#a16207', lineHeight: 1.2 }}>
                                                {nacMomias}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tarjetas de Peso y Rendimiento */}
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <div
                                        style={{
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '14px',
                                            padding: '1rem 1.25rem',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            <small className="text-muted fw-bold d-block" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                                                ⚖️ Peso Total de la Camada
                                            </small>
                                            <span className="fs-5 fw-bold text-dark">
                                                {pesoCamadaNum !== null ? `${pesoCamadaNum} kg` : 'Sin registrar'}
                                            </span>
                                        </div>
                                        <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fs-6 fw-bold">
                                            {pesoCamadaNum !== null ? `${pesoCamadaNum} kg` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div
                                        style={{
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '14px',
                                            padding: '1rem 1.25rem',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            <small className="text-muted fw-bold d-block" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                                                📈 Peso Promedio por Lechón Vivo
                                            </small>
                                            <span className="fs-5 fw-bold text-dark">
                                                {pesoPromedioLechon ? `${pesoPromedioLechon} kg` : 'No calculado'}
                                            </span>
                                        </div>
                                        <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-6 fw-bold">
                                            {pesoPromedioLechon ? `~${pesoPromedioLechon} kg` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cronología del Parto (Fechas y Horas) */}
                            <div
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '16px',
                                    padding: '1.25rem 1.5rem',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                                }}
                            >
                                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                                    <span>🕒</span> Cronograma del Evento de Parto
                                </h6>
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #e2e8f0' }}>
                                            <small className="text-muted d-block fw-semibold mb-1" style={{ fontSize: '11px' }}>
                                                🟢 INICIO DEL PARTO
                                            </small>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span className="fw-bold text-dark fs-6">📅 {formatearFecha(parto.Fec_inicio)}</span>
                                                <span className="badge bg-dark-subtle text-dark px-2.5 py-1 rounded">
                                                    🕒 {formatearHora(parto.Hor_inicial)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #e2e8f0' }}>
                                            <small className="text-muted d-block fw-semibold mb-1" style={{ fontSize: '11px' }}>
                                                🏁 FINALIZACIÓN DEL PARTO
                                            </small>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span className="fw-bold text-dark fs-6">📅 {formatearFecha(parto.Fec_fin)}</span>
                                                <span className="badge bg-dark-subtle text-dark px-2.5 py-1 rounded">
                                                    🕒 {formatearHora(parto.Hor_final)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Responsables */}
                            <div
                                style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '14px',
                                    padding: '1rem 1.25rem',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <small className="text-muted fw-bold d-block mb-2 text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                    👨‍🌾 Personal Responsable de la Atención
                                </small>
                                <div className="d-flex flex-wrap gap-2">
                                    {respNombres.length === 0 ? (
                                        <span className="text-muted small fst-italic">No se especificaron responsables para este parto</span>
                                    ) : (
                                        respNombres.map((nom, idx) => (
                                            <span
                                                key={idx}
                                                className="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm"
                                                style={{ fontSize: '12.5px', fontWeight: 600 }}
                                            >
                                                <span className="text-success me-1">✓</span> {nom}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Observaciones */}
                            {parto.Observaciones && (
                                <div
                                    style={{
                                        backgroundColor: '#f0fdf4',
                                        borderRadius: '14px',
                                        padding: '1rem 1.25rem',
                                        border: '1px solid #bbf7d0',
                                        borderLeft: '5px solid #22c55e'
                                    }}
                                >
                                    <small className="text-success-emphasis fw-bold d-block mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                        📝 Observaciones Registradas
                                    </small>
                                    <p className="mb-0 text-dark small" style={{ lineHeight: 1.5 }}>
                                        {parto.Observaciones}
                                    </p>
                                </div>
                            )}

                            {/* Lechones Individualizados */}
                            <div
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '16px',
                                    padding: '1.25rem 1.5rem',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                                        <span>🐷</span> Lechones Registrados en el Sistema ({parto.lechones?.length || 0})
                                    </h6>
                                    {parto.lechones?.length > 0 && (
                                        <span className="badge bg-info-subtle text-info border border-info-subtle px-2.5 py-1 rounded-pill small">
                                            Individualizados
                                        </span>
                                    )}
                                </div>

                                {Array.isArray(parto.lechones) && parto.lechones.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="py-2">Identificación</th>
                                                    <th className="py-2">Sexo</th>
                                                    <th className="py-2">Peso al Nacer</th>
                                                    <th className="py-2">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parto.lechones.map((l, index) => {
                                                    const esHembra = (l.Gen_Porcino || '').toUpperCase() === 'H'
                                                    return (
                                                        <tr key={l.Id_Porcino || index}>
                                                            <td className="fw-semibold text-dark">
                                                                {l.Nom_Porcino || (l.Num_Chapeta ? `Chapeta ${l.Num_Chapeta}` : `Lechón #${l.Id_Porcino}`)}
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${esHembra ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} px-2 py-1 rounded-pill`} style={{ fontSize: '11px' }}>
                                                                    {esHembra ? '♀ Hembra' : '♂ Macho'}
                                                                </span>
                                                            </td>
                                                            <td className="fw-semibold">
                                                                {l.Pes_Nacer ? `${l.Pes_Nacer} kg` : '---'}
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill" style={{ fontSize: '11px' }}>
                                                                    {l.Estado || 'Activo'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-3 px-2 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                        <p className="text-muted small mb-0">
                                            No se han ingresado fichas individuales de lechones para este parto aún.
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Fijo (Siempre visible y anclado) */}
                <div
                    style={{
                        flexShrink: 0,
                        padding: '0.85rem 1.75rem',
                        backgroundColor: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.75rem'
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-secondary px-4 py-2 fw-semibold rounded-pill shadow-sm"
                        onClick={onClose}
                    >
                        Cerrar Ficha
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalDetalleParto
