import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../../styles/calendarioReproductivo.css'

const EVENTOS = [
    { key: 'rc1', nombre: '1er control de recelo', dias: 21, icon: '🔍', iconClass: 'evento-icon-rc1', esRecelo: true },
    { key: 'rc2', nombre: '2° control de recelo', dias: 42, icon: '🔍', iconClass: 'evento-icon-rc2', esRecelo: true },
    { key: 'cambio_alimento', nombre: 'Cambio de alimento', dias: 100, icon: '🌽', iconClass: 'evento-icon-cambio', esRecelo: false },
    { key: 'dia_107', nombre: 'Traslado a lactancia', dias: 107, icon: '🏠', iconClass: 'evento-icon-107', esRecelo: false },
    { key: 'parto', nombre: 'Fecha probable de parto', dias: 114, icon: '🐷', iconClass: 'evento-icon-parto', esRecelo: false },
]

const CalendarioForm = ({ hideModal, calendarioEdit, reload, preloaded, isInactive, cicloData }) => {

    const MySwal = withReactContent(Swal)

    const [calendario, setCalendario] = useState(calendarioEdit || null)
    const [loading, setLoading] = useState(false)

    // Panel lateral de revisión
    const [revisionPanel, setRevisionPanel] = useState(null)
    const [revFechaRevision, setRevFechaRevision] = useState('')
    const [revResultado, setRevResultado] = useState('')
    const [revObservaciones, setRevObservaciones] = useState('')

    // Datos del ciclo
    const cData = cicloData || {}
    const nombreCerda = cData.nombreCerda || preloaded?.porcino?.Nom_Porcino || 'Sin nombre'
    const idCiclo = cData.Id_Ciclo || preloaded?.Id_Ciclo || calendario?.Id_Ciclo || ''
    const tipoCiclo = cData.TipoCiclo || preloaded?.TipoCiclo || 'Monta'
    const activo = cData.activo ?? preloaded?.activo ?? 'S'
    const estadoCiclo = activo === 'S' ? 'Activo' : 'Inactivo'

    const fechaServicioRaw = cData.fechaServicio || preloaded?.Fecha_Servicio || calendario?.Fecha_Servicio || ''
    const fechaServicio = fechaServicioRaw ? fechaServicioRaw.split('T')[0] : ''

    // Calcular días de gestación
    const calcularDiasGestacion = () => {
        if (!fechaServicio) return 0
        const servicio = new Date(fechaServicio + 'T00:00:00')

        // Si hubo recelo, calculamos hasta la fecha del recelo
        if (calendario?.resultado_rc1 === 'recelo_detectado' && calendario?.real_rc1) {
            const fin = new Date(calendario.real_rc1.split('T')[0] + 'T00:00:00')
            const diff = Math.floor((fin - servicio) / (1000 * 60 * 60 * 24))
            return diff > 0 ? diff : 0
        }
        if (calendario?.resultado_rc2 === 'recelo_detectado' && calendario?.real_rc2) {
            const fin = new Date(calendario.real_rc2.split('T')[0] + 'T00:00:00')
            const diff = Math.floor((fin - servicio) / (1000 * 60 * 60 * 24))
            return diff > 0 ? diff : 0
        }

        // Si ya parió
        if (calendario?.real_parto) {
            const fin = new Date(calendario.real_parto.split('T')[0] + 'T00:00:00')
            const diff = Math.floor((fin - servicio) / (1000 * 60 * 60 * 24))
            return diff > 0 ? diff : 0
        }

        const hoy = new Date()
        const diff = Math.floor((hoy - servicio) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 0
    }

    const diasGestacion = calcularDiasGestacion()

    // Calcular fecha probable de parto
    const calcularFechaParto = () => {
        if (!fechaServicio) return '—'
        const d = new Date(fechaServicio + 'T00:00:00')
        d.setDate(d.getDate() + 114)
        return formatDate(d.toISOString().split('T')[0])
    }

    // Proyectar fechas
    const proyectarFecha = (dias) => {
        if (!fechaServicio) return null
        const d = new Date(fechaServicio + 'T00:00:00')
        d.setDate(d.getDate() + dias)
        return d.toISOString().split('T')[0]
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        const clean = dateStr.split('T')[0]
        return clean.split('-').reverse().join('/')
    }

    const isSiguienteRegistrado = (eventoKey) => {
        const index = EVENTOS.findIndex(e => e.key === eventoKey)
        if (index === -1) return false
        for (let i = index + 1; i < EVENTOS.length; i++) {
            const evData = getEventoData(EVENTOS[i])
            if (evData.fechaReal) return true
        }
        return false
    }

    // ID del ciclo desde cualquier fuente disponible
    const resolvedIdCiclo = cData.Id_Ciclo || preloaded?.Id_Ciclo || calendario?.Id_Ciclo || ''

    // Crear calendario si no existe al montar
    useEffect(() => {
        if (!calendario && resolvedIdCiclo && fechaServicio) {
            crearCalendario()
        }
    }, [])

    const crearCalendario = async () => {
        const cicloId = resolvedIdCiclo
        if (!cicloId || !fechaServicio) return null

        setLoading(true)
        try {
            const response = await apiAxios.post('/calendario/', {
                Id_Ciclo: cicloId,
                Fecha_Servicio: fechaServicio
            })
            setCalendario(response.data)
            setLoading(false)
            return response.data
        } catch (error) {
            // Si ya existe, obtenerlo
            if (error.response?.status === 400) {
                try {
                    const res = await apiAxios.get(`/calendario/ciclo/${cicloId}`)
                    if (res.data) {
                        setCalendario(res.data)
                        setLoading(false)
                        return res.data
                    }
                } catch (e) {
                    console.error(e)
                }
            } else {
                console.error(error)
            }
        }
        setLoading(false)
        return null
    }

    // Obtener datos del evento del calendario
    const getEventoData = (evento) => {
        if (!calendario) return { fechaProyectada: proyectarFecha(evento.dias), fechaReal: null, resultado: null, observaciones: null }

        const map = {
            rc1: { proj: 'rc1', real: 'real_rc1', resultado: 'resultado_rc1', obs: 'observaciones_rc1' },
            rc2: { proj: 'rc2', real: 'real_rc2', resultado: 'resultado_rc2', obs: 'observaciones_rc2' },
            cambio_alimento: { proj: 'cambio_alimento', real: 'real_cambio_alimento', resultado: null, obs: 'observaciones_cambio' },
            dia_107: { proj: 'dia_107', real: 'real_dia_107', resultado: null, obs: 'observaciones_107' },
            parto: { proj: 'parto', real: 'real_parto', resultado: null, obs: 'observaciones_parto' },
        }

        const m = map[evento.key]
        return {
            fechaProyectada: calendario[m.proj]?.split('T')[0] || proyectarFecha(evento.dias),
            fechaReal: calendario[m.real]?.split('T')[0] || null,
            resultado: m.resultado ? calendario[m.resultado] : null,
            observaciones: m.obs ? calendario[m.obs] : null,
        }
    }

    // Determinar el estado de un evento
    const getEstado = (evento) => {
        const data = getEventoData(evento)

        // Si se detectó recelo en RC1, los siguientes no aplican
        if (calendario?.resultado_rc1 === 'recelo_detectado') {
            if (evento.key !== 'rc1') return 'no_aplica'
        }

        // Si RC1 fue "no recelo" y RC2 detectó recelo
        if (calendario?.resultado_rc2 === 'recelo_detectado') {
            if (evento.key !== 'rc1' && evento.key !== 'rc2') return 'no_aplica'
        }

        if (data.fechaReal) {
            if (evento.esRecelo) {
                if (data.resultado === 'no_recelo') return 'no_recelo'
                if (data.resultado === 'recelo_detectado') return 'recelo_detectado'
                return 'realizado'
            }
            return 'realizado'
        }

        return 'pendiente'
    }

    // Render status badge
    const renderStatus = (evento) => {
        const estado = getEstado(evento)

        switch (estado) {
            case 'pendiente':
                return <span className="cal-status cal-status-pendiente">⏳ Pendiente</span>
            case 'no_recelo':
                return <span className="cal-status cal-status-no-recelo">✅ No presentó recelo</span>
            case 'recelo_detectado':
                return <span className="cal-status cal-status-recelo">🔴 Recelo detectado</span>
            case 'realizado':
                return <span className="cal-status cal-status-realizado">☑️ Realizado</span>
            case 'no_aplica':
                return <span className="cal-status cal-status-no-aplica">— No aplica</span>
            default:
                return <span className="cal-status cal-status-pendiente">⏳ Pendiente</span>
        }
    }

    // Render action button
    const renderAction = (evento) => {
        const estado = getEstado(evento)
        const data = getEventoData(evento)

        if (isInactive) return null
        if (estado === 'no_aplica') return null
        if (!fechaServicio) return null

        const isDisabledByNext = isSiguienteRegistrado(evento.key)

        if (estado === 'pendiente') {
            return (
                <button
                    className="cal-btn-registrar"
                    onClick={() => abrirPanelRevision(evento, data)}
                    disabled={isInactive || isDisabledByNext}
                    title={isDisabledByNext ? "No se puede registrar porque ya hay revisiones posteriores" : "Registrar revisión"}
                >
                    Registrar revisión
                </button>
            )
        }

        return (
            <div className="d-flex gap-1">
                <button
                    className="cal-btn-editar"
                    onClick={() => abrirPanelRevision(evento, data)}
                    title={isDisabledByNext ? "No se puede editar porque ya hay revisiones posteriores" : "Editar revisión"}
                    disabled={isInactive || isDisabledByNext}
                >
                    ✏️
                </button>
            </div>
        )
    }

    // Open revision panel
    const abrirPanelRevision = (evento, data) => {
        setRevisionPanel(evento)
        setRevFechaRevision(data.fechaReal || '')
        setRevResultado(data.resultado || '')
        setRevObservaciones(data.observaciones || '')
    }

    const cerrarPanelRevision = () => {
        setRevisionPanel(null)
        setRevFechaRevision('')
        setRevResultado('')
        setRevObservaciones('')
    }

    // Submit revision
    const guardarRevision = async () => {
        if (!revFechaRevision) {
            MySwal.fire({ icon: 'warning', title: 'Fecha requerida', text: 'Debes ingresar la fecha de revisión.' })
            return
        }

        if (revisionPanel.esRecelo && !revResultado) {
            MySwal.fire({ icon: 'warning', title: 'Resultado requerido', text: 'Debes seleccionar si presentó recelo o no.' })
            return
        }

        setLoading(true)
        try {
            // Si no existe calendario, crearlo primero
            let cal = calendario
            if (!cal) {
                cal = await crearCalendario()
                if (!cal) {
                    MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el calendario. Verifica que el ciclo tenga una fecha de servicio.' })
                    setLoading(false)
                    return
                }
            }

            const response = await apiAxios.patch(`/calendario/${cal.Id_Calendario}/revision`, {
                evento: revisionPanel.key,
                fecha_revision: revFechaRevision,
                resultado: revisionPanel.esRecelo ? revResultado : null,
                observaciones: revObservaciones || null
            })

            setCalendario(response.data)
            cerrarPanelRevision()

            MySwal.fire({
                icon: 'success',
                title: 'Revisión registrada',
                text: `${revisionPanel.nombre} actualizado correctamente`,
                timer: 2000,
                showConfirmButton: false
            })

            reload && reload()

        } catch (error) {
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar la revisión'
            })
        }
        setLoading(false)
    }

    // Estado label para badge
    const getEstadoLabel = () => {
        if (calendario?.resultado_rc1 === 'recelo_detectado' || calendario?.resultado_rc2 === 'recelo_detectado') {
            return 'Fallida (Recelo detectado)'
        }
        if (calendario?.real_parto) return 'Completado (Parió)'
        if (activo === 'S') return 'Activo (Gestante)'
        return 'Inactivo'
    }

    if (loading && !calendario) {
        return (
            <div className="cal-loading">
                <div className="cal-loading-spinner"></div>
                <span>Cargando calendario...</span>
            </div>
        )
    }

    return (
        <div className="cal-container">
            {/* ── Header Info Card ──────────────────── */}
            <div className="cal-header-card">
                <div className="cal-cerda-avatar">🐷</div>

                <div className="cal-cerda-info">
                    <h3>Cerda: {nombreCerda}</h3>
                    <div className="cal-meta">
                        <strong>ID Ciclo:</strong> {idCiclo} &nbsp;|&nbsp;
                        <strong>Tipo:</strong> {tipoCiclo}<br />
                        <strong>Fecha del primer servicio:</strong> {fechaServicio ? formatDate(fechaServicio) : '—'}
                    </div>
                </div>

                <div className="cal-badges">
                    <div className="cal-badge cal-badge-dias">
                        <span className="cal-badge-icon">📅</span>
                        <div>
                            <span className="cal-badge-label">Días de gestación</span>
                            <span className="cal-badge-value">{diasGestacion} días</span>
                        </div>
                    </div>

                    <div className="cal-badge cal-badge-estado">
                        <span className="cal-badge-icon">💚</span>
                        <div>
                            <span className="cal-badge-label">Estado actual</span>
                            <span className="cal-badge-value">{getEstadoLabel()}</span>
                        </div>
                    </div>

                    <div className="cal-badge cal-badge-parto">
                        <span className="cal-badge-icon">🍼</span>
                        <div>
                            <span className="cal-badge-label">Fecha probable de parto</span>
                            <span className="cal-badge-value">{calcularFechaParto()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Alert Info ────────────────────────── */}
            <div className="cal-alert-info">
                <span className="cal-alert-icon">ℹ️</span>
                <span className="cal-alert-text">
                    Las fechas mostradas son proyectadas automáticamente a partir de la fecha del primer servicio.
                    Puedes registrar las revisiones cuando ocurran.
                </span>
            </div>

            {/* ── Sin calendario creado aún ────────── */}
            {!calendario && (
                <div className="cal-alert-info" style={{ background: '#fff7ed', borderColor: '#fed7aa', color: '#9a3412', marginTop: '1rem' }}>
                    <span className="cal-alert-icon">⚠️</span>
                    <span className="cal-alert-text">
                        No hay calendario creado para este ciclo.
                        {fechaServicio
                            ? ' Se creará automáticamente al guardar la primera revisión.'
                            : ' Registra primero una monta o inseminación para obtener la fecha de servicio.'}
                    </span>
                </div>

            {/* ── Events Table ──────────────────────── */}
            <div className="cal-table-wrapper">
                <table className="cal-table">
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Días desde fecha base</th>
                            <th>Fecha proyectada</th>
                            <th>Fecha de revisión</th>
                            <th>Resultado / Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EVENTOS.map((evento) => {
                            const data = getEventoData(evento)
                            const estado = getEstado(evento)
                            const isDisabled = estado === 'no_aplica'

                            return (
                                <tr key={evento.key} style={isDisabled ? { opacity: 0.5 } : {}}>
                                    <td>
                                        <div className="evento-name">
                                            <span className={`evento-icon ${evento.iconClass}`}>
                                                {evento.icon}
                                            </span>
                                            <div>
                                                <div>{evento.nombre}</div>
                                                {data.observaciones && (
                                                    <div className="text-muted" style={{ fontSize: '0.78rem', fontStyle: 'italic', marginTop: '0.2rem', fontWeight: 'normal' }}>
                                                        📝 Obs: {data.observaciones}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="dias-badge">{evento.dias} días</span>
                                    </td>
                                    <td className="fecha-proyectada">
                                        {formatDate(data.fechaProyectada)}
                                    </td>
                                    <td className="fecha-revision">
                                        {data.fechaReal ? formatDate(data.fechaReal) : '—'}
                                    </td>
                                    <td>{renderStatus(evento)}</td>
                                    <td>{renderAction(evento)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Fecha base ──────────────────────── */}
            <div className="cal-fecha-base">
                Fecha base (primer servicio): {fechaServicio ? formatDate(fechaServicio) : '—'}
            </div>

            {/* ── Legend + Info Importante ─────────── */}
            <div className="cal-footer">
                <div className="cal-footer-grid">
                    <div className="cal-legend">
                        <h5>Leyenda de Resultados</h5>
                        <div className="cal-legend-item">
                            <div className="cal-legend-dot cal-legend-dot-no-recelo"></div>
                            <span className="cal-legend-label">No presentó recelo</span>
                            <span className="cal-legend-desc">La cerda no mostró signos de celo</span>
                        </div>
                        <div className="cal-legend-item">
                            <div className="cal-legend-dot cal-legend-dot-recelo"></div>
                            <span className="cal-legend-label">Recelo detectado</span>
                            <span className="cal-legend-desc">La cerda presentó celo nuevamente</span>
                        </div>
                        <div className="cal-legend-item">
                            <div className="cal-legend-dot cal-legend-dot-no-aplica"></div>
                            <span className="cal-legend-label">No aplica</span>
                            <span className="cal-legend-desc">El evento ya no aplica para este ciclo</span>
                        </div>
                        <div className="cal-legend-item">
                            <div className="cal-legend-dot cal-legend-dot-realizado"></div>
                            <span className="cal-legend-label">Realizado</span>
                            <span className="cal-legend-desc">Evento completado correctamente</span>
                        </div>
                    </div>

                    <div className="cal-info-importante">
                        <h5>Información Importante</h5>
                        <ul>
                            <li>Si la cerda presenta recelo en el 1er o 2do control, los eventos siguientes pasarán a "No aplica".</li>
                            <li>Si no presenta recelo, continúa el seguimiento con los eventos restantes.</li>
                        </ul>
                    </div>
                </div>
            </div>


            {/* ── Revision Side Panel ────────────────── */}
            {revisionPanel && createPortal(
                <div className="cal-revision-overlay" onClick={(e) => { if (e.target === e.currentTarget) cerrarPanelRevision() }}>
                    <div className="cal-revision-panel">
                        <div className="cal-revision-header">
                            <div>
                                <h4>Registrar revisión - {revisionPanel.nombre}</h4>
                                <div className="cal-revision-subtitle">
                                    Fecha proyectada: {formatDate(getEventoData(revisionPanel).fechaProyectada)}
                                    {revisionPanel.dias && ` (${revisionPanel.dias} días desde el primer servicio)`}
                                </div>
                            </div>
                            <button className="cal-revision-close" onClick={cerrarPanelRevision}>✕</button>
                        </div>

                        <div className="cal-revision-body">
                            {/* Fecha de revisión */}
                            <div className="cal-form-group">
                                <label className="cal-form-label">
                                    Fecha de revisión <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="cal-form-input"
                                    value={revFechaRevision}
                                    onChange={(e) => setRevFechaRevision(e.target.value)}
                                    placeholder="dd/mm/aaaa"
                                />
                            </div>

                            {/* Radio buttons - solo para controles de recelo */}
                            {revisionPanel.esRecelo && (
                                <div className="cal-form-group">
                                    <label className="cal-form-label">
                                        ¿Presentó recelo? <span className="required">*</span>
                                    </label>
                                    <div className="cal-radio-group">
                                        <div
                                            className={`cal-radio-option ${revResultado === 'no_recelo' ? 'selected-no-recelo' : ''}`}
                                            onClick={() => setRevResultado('no_recelo')}
                                        >
                                            <input
                                                type="radio"
                                                name="resultado_recelo"
                                                checked={revResultado === 'no_recelo'}
                                                onChange={() => setRevResultado('no_recelo')}
                                            />
                                            <div>
                                                <span className="cal-radio-label">🟢 No presentó recelo</span>
                                                <span className="cal-radio-desc">La cerda no mostró signos de celo</span>
                                            </div>
                                        </div>

                                        <div
                                            className={`cal-radio-option ${revResultado === 'recelo_detectado' ? 'selected-recelo' : ''}`}
                                            onClick={() => setRevResultado('recelo_detectado')}
                                        >
                                            <input
                                                type="radio"
                                                name="resultado_recelo"
                                                checked={revResultado === 'recelo_detectado'}
                                                onChange={() => setRevResultado('recelo_detectado')}
                                            />
                                            <div>
                                                <span className="cal-radio-label">🔴 Sí presentó recelo</span>
                                                <span className="cal-radio-desc">La cerda volvió a entrar en celo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Observaciones */}
                            <div className="cal-form-group">
                                <label className="cal-form-label">Observaciones (opcional)</label>
                                <textarea
                                    className="cal-form-textarea"
                                    value={revObservaciones}
                                    onChange={(e) => setRevObservaciones(e.target.value.slice(0, 200))}
                                    placeholder="Escribir observaciones (opcional)"
                                    maxLength={200}
                                />
                                <div className="cal-char-counter">{revObservaciones.length}/200</div>
                            </div>

                            {/* Context Notes */}
                            {revisionPanel.esRecelo && revResultado === 'no_recelo' && (
                                <div className="cal-context-notes">
                                    <h6>ℹ️ Si no presentó recelo:</h6>
                                    <ul>
                                        <li>Se guarda la revisión.</li>
                                        <li>El ciclo continúa normalmente.</li>
                                        <li>El 2° control sigue pendiente.</li>
                                    </ul>
                                </div>
                            )}

                            {revisionPanel.esRecelo && revResultado === 'recelo_detectado' && (
                                <div className="cal-context-notes cal-context-notes-recelo">
                                    <h6>⚠️ Si presentó recelo:</h6>
                                    <ul>
                                        <li>Se guarda la revisión.</li>
                                        <li>Los siguientes eventos pasan a "No aplica".</li>
                                        <li>Puedes inactivar el ciclo e iniciar uno nuevo.</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="cal-revision-footer">
                            <button className="cal-btn-cancelar" onClick={cerrarPanelRevision}>
                                Cancelar
                            </button>
                            <button
                                className="cal-btn-guardar"
                                onClick={guardarRevision}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    )
}

export default CalendarioForm