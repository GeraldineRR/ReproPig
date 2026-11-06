import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../../styles/calendarioReproductivo.css'
import ModalDetalleParto from "./ModalDetalleParto.jsx"

const EVENTOS = [
    { key: 'rc1', nombre: '1er control de recelo', dias: 21, icon: '🔍', iconClass: 'evento-icon-rc1', esRecelo: true },
    { key: 'rc2', nombre: '2° control de recelo', dias: 42, icon: '🔍', iconClass: 'evento-icon-rc2', esRecelo: true },
    { key: 'cambio_alimento', nombre: 'Cambio de alimento', dias: 100, icon: '🌽', iconClass: 'evento-icon-cambio', esRecelo: false, esOpcionalRealizado: true },
    { key: 'dia_107', nombre: 'Traslado a lactancia', dias: 107, icon: '🏠', iconClass: 'evento-icon-107', esRecelo: false, esOpcionalRealizado: true },
    { key: 'parto', nombre: 'Fecha probable de parto', dias: 114, icon: '🐷', iconClass: 'evento-icon-parto', esRecelo: false },
]

const CalendarioForm = ({ hideModal, calendarioEdit, reload, preloaded, isInactive, cicloData }) => {

    const MySwal = withReactContent(Swal)
    const navigate = useNavigate()

    const [calendario, setCalendario] = useState(calendarioEdit || null)
    const [loading, setLoading] = useState(false)
    const [modalPartoDetalleOpen, setModalPartoDetalleOpen] = useState(false)

    // Panel lateral de revisión
    const [revisionPanel, setRevisionPanel] = useState(null)
    const [revFechaRevision, setRevFechaRevision] = useState('')
    const [revResultado, setRevResultado] = useState('')
    const [revSeRealizo, setRevSeRealizo] = useState('si') // 'si' | 'no' para cambio de alimento y traslado
    const [revObservaciones, setRevObservaciones] = useState('')

    // Datos del ciclo
    const cData = cicloData || {}
    const nombreCerda = cData.nombreCerda || preloaded?.porcino?.Nom_Porcino || 'Sin nombre'
    const idCiclo = cData.Id_Ciclo || preloaded?.Id_Ciclo || calendario?.Id_Ciclo || ''
    const tipoCiclo = cData.TipoCiclo || preloaded?.TipoCiclo || 'Monta'
    const activo = cData.Estado ?? cData.activo ?? preloaded?.Estado ?? 'Activo'
    const isCicloDetenido = Boolean(
        isInactive ||
        (activo && String(activo).trim().toLowerCase() !== 'activo')
    )

    const extractDateOnly = (val) => {
        if (!val) return ''
        return String(val).split('T')[0].split(' ')[0].trim()
    }

    const fechaServicioRaw = cData.fechaServicio || preloaded?.Fecha_Servicio || calendario?.Fecha_Servicio || ''
    const fechaServicio = extractDateOnly(fechaServicioRaw)

    // Calcular días de gestación
    const calcularDiasGestacion = () => {
        if (!fechaServicio) return 0
        const [y, m, d] = fechaServicio.split('-').map(Number)
        if (!y || !m || !d) return 0
        const servicio = new Date(y, m - 1, d)

        // Si hubo recelo, calculamos hasta la fecha del recelo
        if (calendario?.resultado_rc1 === 'recelo_detectado' && calendario?.real_rc1) {
            const clean = extractDateOnly(calendario.real_rc1)
            const [yF, mF, dF] = clean.split('-').map(Number)
            if (yF && mF && dF) {
                const fin = new Date(yF, mF - 1, dF)
                const diff = Math.floor((fin - servicio) / (1000 * 60 * 60 * 24))
                return diff > 0 ? diff : 0
            }
        }
        if (calendario?.resultado_rc2 === 'recelo_detectado' && calendario?.real_rc2) {
            const clean = extractDateOnly(calendario.real_rc2)
            const [yF, mF, dF] = clean.split('-').map(Number)
            if (yF && mF && dF) {
                const fin = new Date(yF, mF - 1, dF)
                const diff = Math.floor((fin - servicio) / (1000 * 60 * 60 * 24))
                return diff > 0 ? diff : 0
            }
        }

        // Si ya parió
        if (calendario?.real_parto) {
            const clean = extractDateOnly(calendario.real_parto)
            const [yF, mF, dF] = clean.split('-').map(Number)
            if (yF && mF && dF) {
                const fin = new Date(yF, mF - 1, dF)
                const diff = Math.floor((fin - servicio) / (1000 * 60 * 60 * 24))
                return diff > 0 ? diff : 0
            }
        }

        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const diff = Math.floor((hoy - servicio) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 0
    }

    const diasGestacion = calcularDiasGestacion()

    // Proyectar fechas
    const proyectarFecha = (dias) => {
        if (!fechaServicio) return null
        const [y, m, d] = fechaServicio.split('-').map(Number)
        if (!y || !m || !d) return null
        const dateObj = new Date(y, m - 1, d, 12, 0, 0)
        dateObj.setDate(dateObj.getDate() + dias)
        const yyyy = dateObj.getFullYear()
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
        const dd = String(dateObj.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }

    // Calcular fecha probable de parto
    const calcularFechaParto = () => {
        const fecha = proyectarFecha(114)
        return fecha ? formatDate(fecha) : '—'
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        const clean = extractDateOnly(dateStr)
        const partes = clean.split('-')
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`
        }
        return clean
    }

    // Comprobar si hay algún evento anterior que aún no se ha registrado
    const isAnteriorPendiente = (eventoKey) => {
        const index = EVENTOS.findIndex(e => e.key === eventoKey)
        if (index <= 0) return { bloqueado: false }

        for (let i = 0; i < index; i++) {
            const evData = getEventoData(EVENTOS[i])
            if (!evData.fechaReal) {
                return {
                    bloqueado: true,
                    anteriorNombre: EVENTOS[i].nombre
                }
            }
        }
        return { bloqueado: false }
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
            cambio_alimento: { proj: 'cambio_alimento', real: 'real_cambio_alimento', resultado: 'resultado_cambio', obs: 'observaciones_cambio' },
            dia_107: { proj: 'dia_107', real: 'real_dia_107', resultado: 'resultado_107', obs: 'observaciones_107' },
            parto: { proj: 'parto', real: 'real_parto', resultado: null, obs: 'observaciones_parto' },
        }

        const m = map[evento.key]
        let res = null
        if (m.resultado) {
            res = calendario[m.resultado]
            if (!res && calendario[m.real] && evento.esOpcionalRealizado) {
                res = 'realizado'
            }
        }

        return {
            fechaProyectada: extractDateOnly(calendario[m.proj]) || proyectarFecha(evento.dias),
            fechaReal: extractDateOnly(calendario[m.real]) || null,
            resultado: res,
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
            if (evento.esOpcionalRealizado) {
                if (data.resultado === 'no_realizado') return 'no_realizado'
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
            case 'no_realizado':
                return <span className="cal-status cal-status-no-realizado">⚠️ No se dio la actividad</span>
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

        if (estado === 'no_aplica') return null

        const isDisabledByNext = isSiguienteRegistrado(evento.key)
        const anteriorCheck = isAnteriorPendiente(evento.key)
        const isBloqueadoPorAnterior = anteriorCheck.bloqueado

        // Para el evento de parto
        if (evento.key === 'parto') {
            const yaRegistrado = !!data.fechaReal
            if (yaRegistrado) {
                return (
                    <button
                        className="cal-btn-editar"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => setModalPartoDetalleOpen(true)}
                        title="Ver detalle del parto registrado"
                    >
                        👁️ Ver Parto
                    </button>
                )
            }

            return (

                <button
                    className="cal-btn-registrar"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => abrirFormularioParto(data)}
                    disabled={isBloqueadoPorAnterior}
                    title={
                        isBloqueadoPorAnterior
                            ? `Debes completar primero la etapa: ${anteriorCheck.anteriorNombre}`
                            : 'Registrar parto'
                    }
                >
                    {isBloqueadoPorAnterior ? '🔒 Bloqueado' : '🐖 Registrar Parto'}
                </button>

            )
        }

        if (estado === 'pendiente') {
            const disabled = isBloqueadoPorAnterior || isDisabledByNext
            const tooltipTitle = isBloqueadoPorAnterior
                ? `Debes completar primero la etapa: ${anteriorCheck.anteriorNombre}`
                : isDisabledByNext
                ? "No se puede registrar porque ya hay revisiones posteriores"
                : "Registrar revisión"

            return (
                <button
                    className="cal-btn-registrar"
                    onClick={() => abrirPanelRevision(evento, data)}
                    disabled={disabled}
                    title={tooltipTitle}
                >
                    {isBloqueadoPorAnterior ? '🔒 Bloqueado' : 'Registrar revisión'}
                </button>
            )
        }

        return (
            <div className="flex gap-2 items-center justify-end w-full">
                <button
                    className="cal-btn-editar"
                    onClick={() => abrirPanelRevision(evento, data)}
                    title={isDisabledByNext ? "No se puede editar porque ya hay revisiones posteriores" : "Editar revisión"}
                    disabled={isDisabledByNext}
                >
                    ✏️ Editar
                </button>
            </div>
        )
    }

    // Abrir formulario de parto (navega a /partos con datos precargados)
    const abrirFormularioParto = (data, openModal = true) => {
        const idPorcino = cData.Id_Porcino || preloaded?.Id_Porcino || preloaded?.porcino?.Id_Porcino || ''
        const idCicloNav = resolvedIdCiclo
        const fechaProyectada = data.fechaProyectada || ''
        const fechaReal = data.fechaReal || fechaProyectada

        if (hideModal) {
            hideModal()
        }

        // Limpiar inmediatamente cualquier backdrop huérfano de Bootstrap y clases del body
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
        document.body.classList.remove('modal-open')
        document.body.style.removeProperty('overflow')
        document.body.style.removeProperty('padding-right')

        setTimeout(() => {
            navigate('/partos', {
                state: {
                    Id_Ciclo: idCicloNav,
                    Id_Porcino: idPorcino,
                    filterPorcinoId: idPorcino,
                    nombreCerda: nombreCerda,
                    openModal: openModal,
                    Fec_inicio: fechaReal,
                    Fec_fin: fechaReal,
                    Hor_inicial: '',
                    Observaciones: `Parto del ciclo #${idCicloNav} - ${nombreCerda}`
                }
            })
        }, 100)
    }

    // Open revision panel
    const abrirPanelRevision = (evento, data) => {
        setRevisionPanel(evento)
        setRevFechaRevision(data.fechaReal || new Date().toISOString().split('T')[0])
        setRevResultado(data.resultado || (evento.esRecelo ? 'no_recelo' : ''))
        if (evento.esOpcionalRealizado) {
            setRevSeRealizo(data.resultado === 'no_realizado' ? 'no' : 'si')
        } else {
            setRevSeRealizo('si')
        }
        setRevObservaciones(data.observaciones || '')
    }

    const cerrarPanelRevision = () => {
        setRevisionPanel(null)
        setRevFechaRevision('')
        setRevResultado('')
        setRevSeRealizo('si')
        setRevObservaciones('')
    }

    // Submit revision
    const guardarRevision = async () => {
        if (isCicloDetenido) {
            MySwal.fire({
                icon: 'error',
                title: 'Ciclo detenido',
                text: 'Este ciclo reproductivo se encuentra cerrado o el porcino está dado de baja. No se pueden registrar ni modificar eventos del calendario.'
            })
            return
        }
        if (!revFechaRevision) {
            MySwal.fire({ icon: 'warning', title: 'Fecha requerida', text: 'Debes ingresar la fecha de revisión.' })
            return
        }

        if (revisionPanel.esRecelo && !revResultado) {
            MySwal.fire({ icon: 'warning', title: 'Resultado requerido', text: 'Debes seleccionar si presentó recelo o no.' })
            return
        }

        if (revisionPanel.esOpcionalRealizado && revSeRealizo === 'no' && !revObservaciones.trim()) {
            MySwal.fire({
                icon: 'warning',
                title: 'Motivo requerido',
                text: 'Debes ingresar el motivo u observación de por qué no se dio esta actividad (ej: complicaciones, parto prematuro, etc.).'
            })
            return
        }

        setLoading(true)
        try {
            // Si no existe calendario en el estado local, asegurar su existencia
            let cal = calendario
            if (!cal || !cal.Id_Calendario) {
                cal = await crearCalendario()
            }
            if (!cal || !cal.Id_Calendario) {
                try {
                    const res = await apiAxios.get(`/calendario/ciclo/${resolvedIdCiclo}`)
                    if (res.data) {
                        cal = res.data
                        setCalendario(res.data)
                    }
                } catch (e) {
                    console.error("Error buscando calendario existente:", e)
                }
            }

            if (!cal || !cal.Id_Calendario) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo crear el calendario. Verifica que el ciclo tenga una fecha de servicio válida (registra monta o inseminación).'
                })
                setLoading(false)
                return
            }

            let resultadoToSend = null
            if (revisionPanel.esRecelo) {
                resultadoToSend = revResultado
            } else if (revisionPanel.esOpcionalRealizado) {
                resultadoToSend = revSeRealizo === 'no' ? 'no_realizado' : 'realizado'
            }

            const calId = cal.Id_Calendario || cal.id || cal.id_calendario
            const response = await apiAxios.put(`/calendario/${calId}/revision`, {
                evento: revisionPanel.key,
                fecha_revision: revFechaRevision,
                resultado: resultadoToSend,
                observaciones: revObservaciones || null
            })

            setCalendario(response.data)
            cerrarPanelRevision()

            if (revisionPanel.esRecelo && revResultado === 'recelo_detectado') {
                try {
                    await apiAxios.put(`/ciclos/${cal.Id_Ciclo}`, { Estado: 'Fallido' })
                    MySwal.fire({
                        icon: 'warning',
                        title: 'Ciclo Fallido',
                        text: 'Recelo detectado. El ciclo actual ha quedado en estado Fallido. Debe iniciar un nuevo ciclo para la cerda.',
                    })
                } catch (e) {
                    console.error("Error actualizando ciclo:", e)
                }
            } else {
                MySwal.fire({
                    icon: 'success',
                    title: 'Etapa registrada',
                    text: revisionPanel.esOpcionalRealizado && revSeRealizo === 'no'
                        ? `${revisionPanel.nombre}: se registró que no se dio la actividad.`
                        : `${revisionPanel.nombre} actualizado correctamente.`,
                    timer: 2000,
                    showConfirmButton: false
                })
            }

            reload && reload()

        } catch (error) {
            console.error("Error al guardar revisión:", error)
            const msg = error.response?.data?.message || error.message || 'Error al guardar la revisión'
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: msg
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
        if (activo === 'Activo') return 'Activo (Gestante)'
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

            )}

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
                            <div className="cal-legend-dot cal-legend-dot-realizado"></div>
                            <span className="cal-legend-label">Realizado</span>
                            <span className="cal-legend-desc">Evento completado correctamente</span>
                        </div>
                        <div className="cal-legend-item">
                            <div className="cal-legend-dot" style={{ background: '#f43f5e' }}></div>
                            <span className="cal-legend-label">No se realizó</span>
                            <span className="cal-legend-desc">No se dio la actividad por complicación u otro motivo</span>
                        </div>
                    </div>

                    <div className="cal-info-importante">
                        <h5>Información Importante</h5>
                        <ul>
                            <li>Las etapas deben registrarse en orden cronológico paso a paso.</li>
                            <li>Si la cerda presenta recelo en el 1er o 2do control, los eventos siguientes pasarán a "No aplica".</li>
                            <li>Para el cambio de alimento o traslado a lactancia, si hubo complicaciones puedes registrar que no se dio la actividad detallando el motivo para poder continuar al parto.</li>
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
                            {/* Radio buttons - para controles de recelo */}
                            {revisionPanel.esRecelo && (
                                <div className="cal-form-group">
                                    <label className="cal-form-label">
                                        ¿Presentó recelo? <span className="required">*</span>
                                    </label>
                                    <div className="cal-radio-group">
                                        <label
                                            className={`cal-radio-option ${revResultado === 'no_recelo' ? 'selected-no-recelo' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input
                                                type="radio"
                                                name="resultado_recelo"
                                                value="no_recelo"
                                                checked={revResultado === 'no_recelo'}
                                                onChange={() => setRevResultado('no_recelo')}
                                            />
                                            <div>
                                                <span className="cal-radio-label">🟢 No presentó recelo</span>
                                                <span className="cal-radio-desc">La cerda no mostró signos de celo</span>
                                            </div>
                                        </label>

                                        <label
                                            className={`cal-radio-option ${revResultado === 'recelo_detectado' ? 'selected-recelo' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input
                                                type="radio"
                                                name="resultado_recelo"
                                                value="recelo_detectado"
                                                checked={revResultado === 'recelo_detectado'}
                                                onChange={() => setRevResultado('recelo_detectado')}
                                            />
                                            <div>
                                                <span className="cal-radio-label">🔴 Sí presentó recelo</span>
                                                <span className="cal-radio-desc">La cerda volvió a entrar en celo</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Radio buttons - para cambio de alimento y traslado a lactancia */}
                            {revisionPanel.esOpcionalRealizado && (
                                <div className="cal-form-group">
                                    <label className="cal-form-label fw-bold">
                                        ¿Se realizó {revisionPanel.nombre.toLowerCase()}? <span className="required">*</span>
                                    </label>
                                    <div className="cal-radio-group">
                                        <label
                                            className={`cal-radio-option ${revSeRealizo === 'si' ? 'selected-no-recelo' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input
                                                type="radio"
                                                name="se_realizo_actividad"
                                                value="si"
                                                checked={revSeRealizo === 'si'}
                                                onChange={() => setRevSeRealizo('si')}
                                            />
                                            <div>
                                                <span className="cal-radio-label">🟢 Sí, se realizó</span>
                                                <span className="cal-radio-desc">
                                                    {revisionPanel.key === 'cambio_alimento'
                                                        ? 'Se completó el cambio a ración de alimento correspondiente.'
                                                        : 'La cerda fue trasladada a la sala de lactancia.'}
                                                </span>
                                            </div>
                                        </label>

                                        <label
                                            className={`cal-radio-option ${revSeRealizo === 'no' ? 'selected-recelo' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input
                                                type="radio"
                                                name="se_realizo_actividad"
                                                value="no"
                                                checked={revSeRealizo === 'no'}
                                                onChange={() => setRevSeRealizo('no')}
                                            />
                                            <div>
                                                <span className="cal-radio-label">⚠️ No se dio esta actividad</span>
                                                <span className="cal-radio-desc">
                                                    {revisionPanel.key === 'dia_107'
                                                        ? 'La cerda tuvo complicaciones, parto prematuro o debió parir en el lugar sin traslado.'
                                                        : 'Hubo complicación, indisponibilidad de insumo o prescripción especial.'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Fecha de revisión */}
                            <div className="cal-form-group">
                                <label className="cal-form-label">
                                    {revisionPanel.esOpcionalRealizado && revSeRealizo === 'no'
                                        ? 'Fecha de constatación / evento'
                                        : 'Fecha de revisión'}{' '}
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="cal-form-input"
                                    value={revFechaRevision}
                                    onChange={(e) => setRevFechaRevision(e.target.value)}
                                    placeholder="dd/mm/aaaa"
                                />
                            </div>

                            {/* Observaciones */}
                            <div className="cal-form-group">
                                <label className={`cal-form-label ${revisionPanel.esOpcionalRealizado && revSeRealizo === 'no' ? 'fw-bold text-danger' : ''}`}>
                                    {revisionPanel.esOpcionalRealizado && revSeRealizo === 'no'
                                        ? 'Motivo u observación de por qué no se dio la actividad'
                                        : 'Observaciones (opcional)'}{' '}
                                    <span className="required">{revisionPanel.esOpcionalRealizado && revSeRealizo === 'no' ? '*' : ''}</span>
                                </label>
                                <textarea
                                    className={`cal-form-textarea ${revisionPanel.esOpcionalRealizado && revSeRealizo === 'no' ? 'border-danger' : ''}`}
                                    value={revObservaciones}
                                    onChange={(e) => setRevObservaciones(e.target.value.slice(0, 300))}
                                    placeholder={
                                        revisionPanel.esOpcionalRealizado && revSeRealizo === 'no'
                                            ? 'Explica el motivo (ej: "La cerda tuvo complicaciones y tuvo que parir allí mismo sin traslado")...'
                                            : 'Escribir observaciones (opcional)'
                                    }
                                    maxLength={300}
                                    rows={3}
                                />
                                <div className="cal-char-counter">{revObservaciones.length}/300</div>
                                {revisionPanel.esOpcionalRealizado && revSeRealizo === 'no' && (
                                    <small className="text-danger d-block mt-1">
                                        Es obligatorio registrar el motivo por el cual no se realizó esta etapa.
                                    </small>
                                )}
                            </div>

                            {/* Context Notes */}
                            {revisionPanel.esRecelo && revResultado === 'no_recelo' && (
                                <div className="cal-context-notes">
                                    <h6>ℹ️ Si no presentó recelo:</h6>
                                    <ul>
                                        <li>Se guarda la revisión.</li>
                                        <li>El ciclo continúa normalmente.</li>
                                        <li>Se habilitará la siguiente etapa del calendario.</li>
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

                            {revisionPanel.esOpcionalRealizado && revSeRealizo === 'no' && (
                                <div className="cal-context-notes cal-context-notes-recelo">
                                    <h6>⚠️ Actividad omitida / no realizada:</h6>
                                    <ul>
                                        <li>Se guardará el registro con el motivo especificado.</li>
                                        <li>Permitirá habilitar la etapa siguiente para continuar con el flujo del calendario.</li>
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

            {/* Modal para ver registro de parto sin abrir formulario */}
            <ModalDetalleParto
                isOpen={modalPartoDetalleOpen}
                onClose={() => setModalPartoDetalleOpen(false)}
                idCiclo={resolvedIdCiclo}
            />
        </div>
    )
}

export default CalendarioForm