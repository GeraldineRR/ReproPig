import { useState, useEffect, useMemo } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const MySwal = withReactContent(Swal)

const PartosForm = ({ hideModal, rowToEdit = {}, reload, preloaded = null, onPartoCreated }) => {

    const [Id_Porcino, setPorcino] = useState('')
    const [Id_Ciclo, setId_Ciclo] = useState('')
    const [Fec_inicio, setFec_inicio] = useState('')
    const [Hor_inicial, setHor_inicial] = useState('')
    const [Nac_vivos, setNac_vivos] = useState(0)
    const [Nac_momias, setNac_momias] = useState(0)
    const [Nac_muertos, setNac_muertos] = useState(0)
    const [Pes_camada, setPes_camada] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [Fec_fin, setFec_fin] = useState('')
    const [Hor_final, setHor_final] = useState('')
    const [Id_Responsable, setId_Responsable] = useState([])
    const [porcinos, setPorcinos] = useState([])
    const [ciclos, setCiclos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [textFormButton, setTextFormButton] = useState('Registrar')
    const [showResponsables, setShowResponsables] = useState(false)

    const idCicloPermitido = rowToEdit?.Id_Ciclo || preloaded?.Id_Ciclo || null
    const idPorcinoPermitido = rowToEdit?.Id_Porcino || preloaded?.Id_Porcino || null

    // 🔢 Total automático
    const totalNacidos =
        Number(Nac_vivos) +
        Number(Nac_momias) +
        Number(Nac_muertos)

    useEffect(() => {
        cargarDatos()
        getResponsables()
    }, [])

    const cargarDatos = async () => {
        try {
            const [resPorcinos, resCiclos] = await Promise.all([
                apiAxios.get('/porcino/'),
                apiAxios.get('/ciclos/')
            ])
            setPorcinos(Array.isArray(resPorcinos.data) ? resPorcinos.data : [])
            setCiclos(Array.isArray(resCiclos.data) ? resCiclos.data : [])
        } catch (error) {
            console.error("Error al obtener datos:", error)
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error("Error al obtener responsables:", error)
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

    // Comprobar si un ciclo está activo y tiene los eventos del calendario completados (habilitado para parto)
    const isCicloListoParaParto = (c, cicloPermitidoId = null) => {
        if (!c) return false
        if (cicloPermitidoId && String(c.Id_Ciclo) === String(cicloPermitidoId)) {
            return true
        }

        // El ciclo debe estar activo
        const esActivo = !c.Estado || String(c.Estado).trim().toLowerCase() === 'activo'
        if (!esActivo) return false

        const cal = c.calendario
        if (!cal) return false

        // No debe haber recelo detectado en rc1 o rc2
        if (cal.resultado_rc1 === 'recelo_detectado' || cal.resultado_rc2 === 'recelo_detectado') {
            return false
        }

        // Todos los eventos anteriores al parto deben estar registrados (no pendientes)
        // 1er control de recelo (RC1), 2° control de recelo (RC2), cambio de alimento y día 107
        if (!cal.real_rc1 || !cal.real_rc2 || !cal.real_cambio_alimento || !cal.real_dia_107) {
            return false
        }

        // No debe tener ya parto registrado (ni en cal.real_parto ni en c.partos)
        if (cal.real_parto) {
            return false
        }
        if (Array.isArray(c.partos) && c.partos.length > 0) {
            return false
        }

        return true
    }

    // Filtrar solo las cerdas con ciclo activo y fecha probable de parto habilitada
    const cerdasHabilitadas = useMemo(() => {
        return porcinos.filter(p => {
            const gen = p.Gen_Porcino?.trim().toUpperCase()
            const tipo = p.Tipo_Cerdo?.trim().toLowerCase()
            const esHembra = gen === 'H' || gen === 'HEMBRA'
            const esAdulta = !tipo || tipo === 'adulto' || tipo === 'adulta'
            const esActiva = (p.Estado || '').trim().toLowerCase() === 'activo'
            const esLaPermitida = idPorcinoPermitido && String(p.Id_Porcino) === String(idPorcinoPermitido)

            if (!esLaPermitida && (!esHembra || !esAdulta || !esActiva)) {
                return false
            }

            // Debe tener al menos un ciclo activo con calendario completado hasta día 107
            const tieneCicloListo = ciclos.some(c => {
                const idCerdaCiclo = c.Id_Cerda || c.porcino?.Id_Porcino
                return String(idCerdaCiclo) === String(p.Id_Porcino) && isCicloListoParaParto(c, idCicloPermitido)
            })

            return tieneCicloListo || esLaPermitida
        })
    }, [porcinos, ciclos, idPorcinoPermitido, idCicloPermitido])

    // Filtrar ciclos habilitados para parto
    const ciclosHabilitados = useMemo(() => {
        return ciclos.filter(c => isCicloListoParaParto(c, idCicloPermitido))
    }, [ciclos, idCicloPermitido])

    // Filtrar ciclos disponibles según la cerda seleccionada
    const ciclosDisponibles = useMemo(() => {
        if (!Id_Porcino) return ciclosHabilitados
        return ciclosHabilitados.filter(c => {
            const idCerdaCiclo = c.Id_Cerda || c.porcino?.Id_Porcino
            return String(idCerdaCiclo) === String(Id_Porcino)
        })
    }, [ciclosHabilitados, Id_Porcino])

    // Asegurar que el ciclo actual (si viene precargado o editando) figure en la lista
    const ciclosOptions = useMemo(() => {
        const list = [...ciclosDisponibles]
        if (Id_Ciclo && !list.some(c => String(c.Id_Ciclo) === String(Id_Ciclo))) {
            const actual = ciclos.find(c => String(c.Id_Ciclo) === String(Id_Ciclo))
            if (actual) {
                list.unshift(actual)
            } else {
                list.unshift({ Id_Ciclo: Number(Id_Ciclo), TipoCiclo: 'Ciclo vinculado', Estado: 'Activo' })
            }
        }
        return list
    }, [ciclosDisponibles, Id_Ciclo, ciclos])

    useEffect(() => {
        if (rowToEdit?.Id_parto) {
            // Modo edición: cargar datos del parto existente
            setPorcino(rowToEdit.Id_Porcino ? String(rowToEdit.Id_Porcino) : '')
            setId_Ciclo(rowToEdit.Id_Ciclo ? String(rowToEdit.Id_Ciclo) : '')
            setFec_inicio(rowToEdit.Fec_inicio?.split('T')[0] || '')
            setHor_inicial(rowToEdit.Hor_inicial || '')
            setNac_vivos(rowToEdit.Nac_vivos || 0)
            setNac_momias(rowToEdit.Nac_momias || 0)
            setNac_muertos(rowToEdit.Nac_muertos || 0)
            setPes_camada(rowToEdit.Pes_camada || '')
            setObservaciones(rowToEdit.Observaciones || '')
            setFec_fin(rowToEdit.Fec_fin?.split('T')[0] || '')
            setHor_final(rowToEdit.Hor_final || '')
            setId_Responsable(parsearResponsables(rowToEdit.Id_Responsable))
            setTextFormButton("Actualizar")
        } else if (preloaded) {
            // Modo precargado desde ciclo/calendario
            setPorcino(preloaded.Id_Porcino ? String(preloaded.Id_Porcino) : '')
            setId_Ciclo(preloaded.Id_Ciclo ? String(preloaded.Id_Ciclo) : '')
            setFec_inicio(preloaded.Fec_inicio?.split('T')[0] || '')
            setFec_fin(preloaded.Fec_fin?.split('T')[0] || '')
            setHor_inicial(preloaded.Hor_inicial || '')
            setObservaciones(preloaded.Observaciones || '')
            setNac_vivos(0)
            setNac_momias(0)
            setNac_muertos(0)
            setPes_camada('')
            setHor_final('')
            setId_Responsable([])
            setTextFormButton("Registrar")
        } else {
            resetForm()
        }
    }, [rowToEdit, preloaded])

    const resetForm = () => {
        setPorcino('')
        setId_Ciclo('')
        setFec_inicio('')
        setHor_inicial('')
        setNac_vivos(0)
        setNac_momias(0)
        setNac_muertos(0)
        setPes_camada('')
        setObservaciones('')
        setFec_fin('')
        setHor_final('')
        setId_Responsable([])
        setTextFormButton("Registrar")
    }

    const toggleResponsable = (id) => {
        const numId = Number(id)
        setId_Responsable(prev =>
            prev.includes(numId) ? prev.filter(r => r !== numId) : [...prev, numId]
        )
    }

    const handlePorcinoChange = (e) => {
        const val = e.target.value
        setPorcino(val)
        if (!val) {
            setId_Ciclo('')
            return
        }

        // Buscar ciclos habilitados para esta cerda
        const ciclosDeCerda = ciclosHabilitados.filter(c => {
            const idCerdaCiclo = c.Id_Cerda || c.porcino?.Id_Porcino
            return String(idCerdaCiclo) === String(val)
        })

        if (ciclosDeCerda.length === 1) {
            const cAuto = ciclosDeCerda[0]
            setId_Ciclo(String(cAuto.Id_Ciclo))
            if (!Fec_inicio && cAuto.calendario?.parto) {
                const f = String(cAuto.calendario.parto).split('T')[0]
                setFec_inicio(f)
                if (!Fec_fin) setFec_fin(f)
            }
        } else if (Id_Ciclo) {
            const pertenece = ciclosDeCerda.some(c => String(c.Id_Ciclo) === String(Id_Ciclo))
            if (!pertenece) setId_Ciclo('')
        }
    }

    const handleCicloChange = (e) => {
        const val = e.target.value
        setId_Ciclo(val)
        if (val) {
            const c = ciclos.find(item => String(item.Id_Ciclo) === String(val))
            const idCerda = c?.Id_Cerda || c?.porcino?.Id_Porcino
            if (idCerda) {
                setPorcino(String(idCerda))
            }
            if (!Fec_inicio && c?.calendario?.parto) {
                const f = String(c.calendario.parto).split('T')[0]
                setFec_inicio(f)
                if (!Fec_fin) setFec_fin(f)
            }
        }
    }

    const handleFecInicioChange = (e) => {
        const val = e.target.value
        setFec_inicio(val)
        if (!Fec_fin || Fec_fin === Fec_inicio) {
            setFec_fin(val)
        }
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (!Id_Porcino || !Id_Ciclo || !Fec_inicio || !Hor_inicial) {
            return MySwal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Porcino, ciclo reproductivo habilitado, fecha y hora inicial son obligatorios"
            })
        }

        const cicloSeleccionado = ciclos.find(c => String(c.Id_Ciclo) === String(Id_Ciclo))
        if (!isCicloListoParaParto(cicloSeleccionado, idCicloPermitido)) {
            return MySwal.fire({
                icon: "error",
                title: "Ciclo no habilitado",
                text: "El ciclo seleccionado no tiene habilitada la fecha probable de parto o tiene eventos pendientes en el calendario."
            })
        }

        if (totalNacidos === 0) {
            return MySwal.fire({
                icon: "warning",
                title: "Datos inválidos",
                text: "Debe haber al menos un nacimiento"
            })
        }

        const data = {
            Id_Porcino: Number(Id_Porcino),
            Id_Ciclo: Number(Id_Ciclo),
            Fec_inicio,
            Hor_inicial,
            Nac_vivos: Number(Nac_vivos),
            Nac_momias: Number(Nac_momias),
            Nac_muertos: Number(Nac_muertos),
            Pes_camada,
            Observaciones,
            Fec_fin,
            Hor_final,
            Id_Responsable: Id_Responsable.length > 0 ? JSON.stringify(Id_Responsable) : null
        }

        try {
            if (rowToEdit?.Id_parto) {
                await apiAxios.put(`/partos/${rowToEdit.Id_parto}`, data)
                MySwal.fire("Actualizado", "Parto actualizado correctamente", "success")
            } else {
                const response = await apiAxios.post("/partos/", data)
                const created = response.data.Partos
                
                MySwal.fire({
                    title: "Registrado", 
                    text: "Parto creado correctamente", 
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })

                // Notify parent if there are live piglets to register
                if (onPartoCreated && data.Nac_vivos > 0 && created?.Id_parto) {
                    const p = porcinos.find(x => String(x.Id_Porcino) === String(Id_Porcino));
                    const nombreMadre = p ? (p.Nom_Porcino || p.Num_Chapeta || `Cerda #${p.Id_Porcino}`) : `Cerda #${Id_Porcino}`;
                    onPartoCreated(created.Id_parto, data.Nac_vivos, data.Fec_inicio, nombreMadre)
                }
            }

            // Sincronizar fecha de revisión en el Calendario si hay ciclo asociado
            if (Id_Ciclo) {
                try {
                    const fechaRev = Fec_fin || Fec_inicio
                    const calRes = await apiAxios.get(`/calendario/ciclo/${Id_Ciclo}`).catch(() => null)
                    if (calRes?.data?.Id_Calendario) {
                        await apiAxios.patch(`/calendario/${calRes.data.Id_Calendario}/revision`, {
                            evento: 'parto',
                            fecha_revision: fechaRev,
                            observaciones: Observaciones || null
                        }).catch(() => null)
                    }
                } catch (calSyncErr) {
                    console.warn("Sincronización en calendario:", calSyncErr)
                }
            }

            await reload()
            hideModal()
            resetForm()

        } catch (error) {
            console.error(error)
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || error.message || "No se pudo guardar el parto"
            })
        }
    }

    return (
        <form onSubmit={gestionarForm}>

            <div className="text-center mb-4">
                <h5 className="fw-bold">🐖 {rowToEdit?.Id_parto ? 'Editar Parto' : 'Registrar Parto'}</h5>
                <small className="text-muted">Gestión de partos reproductivos</small>
            </div>

            {/* Aviso de requisitos si no hay cerdas listas */}
            {cerdasHabilitadas.length === 0 && (
                <div className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2 small">
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span>
                        <strong>No hay cerdas habilitadas para parto:</strong> Solo se permite registrar partos a cerdas que tengan un ciclo activo y hayan completado todos los eventos del calendario reproductivo (1° y 2° control de recelo sin recelo, cambio de alimento y traslado a lactancia en el día 107).
                    </span>
                </div>
            )}

            {/* Selección de Porcino y Ciclo */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🐷 Porcino (Cerda Habilitada)</label>
                    <select
                        className="form-control"
                        value={Id_Porcino}
                        onChange={handlePorcinoChange}
                        required
                    >
                        <option value="">
                            {cerdasHabilitadas.length === 0
                                ? "No hay cerdas con ciclo habilitado para parto"
                                : "Seleccione cerda habilitada..."}
                        </option>
                        {cerdasHabilitadas.map(p => (
                            <option key={p.Id_Porcino} value={p.Id_Porcino}>
                                {p.Nom_Porcino || (p.Num_Chapeta ? `Chapeta ${p.Num_Chapeta}` : `Cerda #${p.Id_Porcino}`)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">🔄 Ciclo Reproductivo (Habilitado)</label>
                    <select
                        className="form-control"
                        value={Id_Ciclo}
                        onChange={handleCicloChange}
                        required
                    >
                        <option value="">
                            {Id_Porcino
                                ? (ciclosDisponibles.length === 0 ? "Sin ciclos habilitados para esta cerda" : "Seleccione ciclo habilitado...")
                                : (ciclosHabilitados.length === 0 ? "No hay ciclos habilitados" : "Seleccione ciclo habilitado...")}
                        </option>
                        {ciclosOptions.map(c => {
                            const cerdaNombre = c.porcino?.Nom_Porcino || (c.Id_Cerda ? `Cerda #${c.Id_Cerda}` : '')
                            const fechaPartoStr = c.calendario?.parto ? ` - F.Prob: ${String(c.calendario.parto).split('T')[0]}` : ''
                            return (
                                <option key={c.Id_Ciclo} value={c.Id_Ciclo}>
                                    Ciclo #{c.Id_Ciclo} {c.TipoCiclo ? `- ${c.TipoCiclo}` : ''}{fechaPartoStr}
                                    {!Id_Porcino && cerdaNombre ? ` — ${cerdaNombre}` : ''}
                                </option>
                            )
                        })}
                    </select>
                </div>
            </div>

            {/* Ciclo vinculado (info visual) */}
            {Id_Ciclo && (
                <div className="alert alert-success py-2 px-3 mb-3 d-flex align-items-center gap-2">
                    <span>✅</span>
                    <span className="small">
                        Parto vinculado al <strong>Ciclo #{Id_Ciclo}</strong> (eventos previos del calendario completados). La fecha de parto actualizará el evento en el Calendario.
                    </span>
                </div>
            )}

            {/* Inicio */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha inicio</label>
                    <input type="date" className="form-control" value={Fec_inicio} onChange={handleFecInicioChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🕒 Hora inicio</label>
                    <input type="time" className="form-control" value={Hor_inicial} onChange={(e) => setHor_inicial(e.target.value)} required />
                </div>
            </div>

            {/* Responsables */}
            <div className="mb-3 position-relative">
                <label className="form-label fw-semibold d-block">
                    👨‍🌾 Responsables ({Id_Responsable.length})
                </label>
                <div className="d-flex flex-wrap gap-2">
                    {responsables.length === 0 ? (
                        <span className="text-muted small">No hay responsables registrados</span>
                    ) : (
                        responsables.map(r => {
                            const activo = Id_Responsable.includes(Number(r.Id_Responsable))
                            return (
                                <span
                                    key={r.Id_Responsable}
                                    onClick={() => toggleResponsable(r.Id_Responsable)}
                                    className={`px-3 py-1.5 rounded-pill user-select-none ${activo
                                        ? "bg-success text-white shadow-sm fw-bold"
                                        : "bg-white border text-secondary"
                                        }`}
                                    style={{ cursor: "pointer", fontSize: "13px" }}
                                >
                                    {activo ? "✓ " : "+ "}{r.Nombres} {r.Apellidos || ''}
                                </span>
                            )
                        })
                    )}
                </div>

                {showResponsables && (
                    <ul className="dropdown-menu show w-100 shadow-sm border-0 border-top-0 rounded-bottom" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                        {responsables.length === 0 ? (
                            <li className="dropdown-item text-muted small">No hay responsables registrados</li>
                        ) : (
                            responsables.map(r => {
                                const activo = Id_Responsable.includes(Number(r.Id_Responsable))
                                return (
                                    <li key={r.Id_Responsable} onClick={(e) => { e.stopPropagation(); toggleResponsable(r.Id_Responsable); }}>
                                        <a className="dropdown-item d-flex align-items-center gap-2" href="#" onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input m-0"
                                                checked={activo}
                                                readOnly
                                            />
                                            {r.Nombres} {r.Apellidos || ''}
                                        </a>
                                    </li>
                                )
                            })
                        )}
                    </ul>
                )}
            </div>

            {/* Nacimientos */}
            <div className="row">
                <div className="col">
                    <label className="form-label fw-semibold">🐖 Vivos</label>
                    <input type="number" min="0" className="form-control" value={Nac_vivos} onChange={(e) => setNac_vivos(e.target.value)} />
                </div>
                <div className="col">
                    <label className="form-label fw-semibold">☠️ Muertos</label>
                    <input type="number" min="0" className="form-control" value={Nac_muertos} onChange={(e) => setNac_muertos(e.target.value)} />
                </div>
                <div className="col">
                    <label className="form-label fw-semibold">🪨 Momias</label>
                    <input type="number" min="0" className="form-control" value={Nac_momias} onChange={(e) => setNac_momias(e.target.value)} />
                </div>
            </div>

            {/* Total automático */}
            <div className="mt-2 mb-3">
                <span className="badge bg-dark">
                    📊 Total nacidos: {totalNacidos}
                </span>
            </div>

            {/* Peso */}
            <div className="mb-3 mt-3">
                <label className="form-label fw-semibold">⚖️ Peso camada (kg)</label>
                <input type="number" step="0.01" className="form-control" value={Pes_camada} onChange={(e) => setPes_camada(e.target.value)} />
            </div>

            {/* Observaciones */}
            <div className="mb-3">
                <label className="form-label fw-semibold">📝 Observaciones</label>
                <textarea className="form-control" value={Observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>

            {/* Fin */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha fin</label>
                    <input type="date" className="form-control" value={Fec_fin} onChange={(e) => setFec_fin(e.target.value)} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🕒 Hora fin</label>
                    <input type="time" className="form-control" value={Hor_final} onChange={(e) => setHor_final(e.target.value)} required />
                </div>
            </div>

            <div className="d-flex gap-2 mt-4">
                <button type="button" className="btn btn-secondary w-50 py-2" onClick={hideModal}>
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="btn btn-primary w-50 shadow-sm fw-bold py-2"
                    disabled={cerdasHabilitadas.length === 0 && !rowToEdit?.Id_parto}
                >
                    {textFormButton}
                </button>
            </div>

        </form>
    )
}

export default PartosForm