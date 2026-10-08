import { useState, useEffect } from "react"
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

    // 🔢 Total automático
    const totalNacidos =
        Number(Nac_vivos) +
        Number(Nac_momias) +
        Number(Nac_muertos)

    useEffect(() => {
        getPorcinos()
        getResponsables()
        getCiclos()
    }, [])

    const getPorcinos = async () => {
        try {
            const res = await apiAxios.get('/porcino/')
            const lista = Array.isArray(res.data) ? res.data : []
            setPorcinos(lista.filter(p => {
                const gen = p.Gen_Porcino?.trim().toUpperCase()
                const tipo = p.Tipo_Cerdo?.trim().toLowerCase()
                const esHembra = gen === 'H' || gen === 'HEMBRA'
                const esAdulta = !tipo || tipo === 'adulto' || tipo === 'adulta'
                return esHembra && esAdulta
            }))
        } catch (error) {
            console.error("Error al obtener porcinos:", error)
        }
    }

    const getCiclos = async () => {
        try {
            const res = await apiAxios.get('/ciclos/')
            setCiclos(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error("Error al obtener ciclos:", error)
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(res.data)
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

    useEffect(() => {
        if (rowToEdit?.Id_parto) {
            // Modo edición: cargar datos del parto existente
            setPorcino(rowToEdit.Id_Porcino || '')
            setId_Ciclo(rowToEdit.Id_Ciclo || '')
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
            setPorcino(preloaded.Id_Porcino || '')
            setId_Ciclo(preloaded.Id_Ciclo || '')
            setFec_inicio(preloaded.Fec_inicio?.split('T')[0] || '')
            setFec_fin(preloaded.Fec_fin?.split('T')[0] || '')
            setHor_inicial(preloaded.Hor_inicial || '08:00')
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
        // Si el ciclo seleccionado no pertenece a la cerda recién elegida, deseleccionar ciclo
        if (Id_Ciclo) {
            const c = ciclos.find(item => String(item.Id_Ciclo) === String(Id_Ciclo))
            if (c && String(c.Id_Cerda) !== String(val) && String(c.porcino?.Id_Porcino) !== String(val)) {
                setId_Ciclo('')
            }
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
        }
    }

    const handleFecInicioChange = (e) => {
        const val = e.target.value
        setFec_inicio(val)
        if (!Fec_fin || Fec_fin === Fec_inicio) {
            setFec_fin(val)
        }
    }

    // Filtrar ciclos únicamente por los que se encuentran activos (o el actualmente vinculado en caso de edición)
    const ciclosActivos = ciclos.filter(c => {
        const esActivo = !c.Estado || String(c.Estado).trim().toLowerCase() === 'activo'
        const esElActual = Id_Ciclo && String(c.Id_Ciclo) === String(Id_Ciclo)
        return esActivo || esElActual
    })

    // Filtrar ciclos disponibles según la cerda seleccionada
    const ciclosDisponibles = Id_Porcino
        ? ciclosActivos.filter(c => String(c.Id_Cerda) === String(Id_Porcino) || String(c.porcino?.Id_Porcino) === String(Id_Porcino))
        : ciclosActivos

    // Asegurar que el ciclo actual (si viene precargado o editando) figure en la lista
    const ciclosOptions = [...ciclosDisponibles]
    if (Id_Ciclo && !ciclosOptions.some(c => String(c.Id_Ciclo) === String(Id_Ciclo))) {
        const actual = ciclos.find(c => String(c.Id_Ciclo) === String(Id_Ciclo))
        if (actual) {
            ciclosOptions.unshift(actual)
        } else {
            ciclosOptions.unshift({ Id_Ciclo: Number(Id_Ciclo), TipoCiclo: 'Ciclo vinculado', Estado: 'Activo' })
        }
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (!Id_Porcino || !Fec_inicio || !Hor_inicial) {
            return MySwal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Porcino, fecha y hora inicial son obligatorios"
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
            Id_Ciclo: Id_Ciclo ? Number(Id_Ciclo) : null,
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
                <small className="text-muted">Gestión de partos</small>
            </div>

            {/* Selección de Porcino y Ciclo */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🐷 Porcino (Cerda)</label>
                    <select
                        className="form-control"
                        value={Id_Porcino}
                        onChange={handlePorcinoChange}
                        required
                    >
                        <option value="">Seleccione cerda...</option>
                        {porcinos.map(p => (
                            <option key={p.Id_Porcino} value={p.Id_Porcino}>
                                {p.Nom_Porcino || (p.Num_Chapeta ? `Chapeta ${p.Num_Chapeta}` : `Cerda #${p.Id_Porcino}`)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">🔄 Ciclo Reproductivo</label>
                    <select
                        className="form-control"
                        value={Id_Ciclo}
                        onChange={handleCicloChange}
                    >
                        <option value="">
                            {Id_Porcino
                                ? (ciclosDisponibles.length === 0 ? "Sin ciclos activos para esta cerda" : "Seleccione ciclo activo (opcional)...")
                                : "Seleccione ciclo activo o elija cerda..."}
                        </option>
                        {ciclosOptions.map(c => {
                            const cerdaNombre = c.porcino?.Nom_Porcino || (c.Id_Cerda ? `Cerda #${c.Id_Cerda}` : '')
                            return (
                                <option key={c.Id_Ciclo} value={c.Id_Ciclo}>
                                    Ciclo #{c.Id_Ciclo} {c.TipoCiclo ? `- ${c.TipoCiclo}` : ''} ({c.Estado || 'Activo'})
                                    {!Id_Porcino && cerdaNombre ? ` — ${cerdaNombre}` : ''}
                                </option>
                            )
                        })}
                    </select>
                </div>
            </div>

            {/* Ciclo vinculado (info visual) */}
            {Id_Ciclo && (
                <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
                    <span>🔗</span>
                    <span className="small">
                        Parto vinculado al <strong>Ciclo #{Id_Ciclo}</strong>. La fecha de parto se reflejará como <strong>fecha de revisión</strong> en el Calendario.
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
                <button type="submit" className="btn btn-primary w-50 shadow-sm fw-bold py-2">
                    {textFormButton}
                </button>
            </div>

        </form>
    )
}

export default PartosForm