import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const ReproduccionesForm = ({ hideModal, reproduccionEdit, onReproduccionCreada }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Reproduccion, setId_Reproduccion] = useState('')
    const [Id_Cerda, setId_Cerda] = useState('')
    const [Activo, setActivo] = useState('S')
    const [TipoReproduccion, setTipoReproduccion] = useState('')
    const [accionEdicion, setAccionEdicion] = useState('') // 'agregar_monta' | 'agregar_inseminacion' | ''
    const [porcinos, setPorcinos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const esEdicion = !!reproduccionEdit?.Id_Reproduccion

    // Qué tipos ya tiene esta reproducción
    const tieneMontas = reproduccionEdit?.montas?.length > 0
    const tieneInseminaciones = reproduccionEdit?.inseminaciones?.length > 0

    useEffect(() => { getPorcinos() }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino')
            setPorcinos(response.data.filter(p => p.Gen_Porcino === 'H'))
        } catch (error) { console.error("Error al obtener porcinos:", error) }
    }

    useEffect(() => {
        if (reproduccionEdit?.Id_Reproduccion) {
            setId_Reproduccion(reproduccionEdit.Id_Reproduccion || '')
            setId_Cerda(reproduccionEdit.Id_Cerda || reproduccionEdit.porcino?.Id_Porcino || '')
            setActivo(reproduccionEdit.Activo || 'S')
            setTipoReproduccion(reproduccionEdit.TipoReproduccion || '')
            setAccionEdicion('')
            setTextFormButton("Actualizar")
        } else {
            setId_Reproduccion('')
            setId_Cerda('')
            setActivo('S')
            setTipoReproduccion('')
            setAccionEdicion('')
            setTextFormButton("Enviar")
        }
    }, [reproduccionEdit?.Id_Reproduccion])

    const gestionarForm = async (e) => {
        e.preventDefault()

        try {
            if (!esEdicion) {
                // ── CREAR NUEVA REPRODUCCIÓN ──────────────────────────────
                if (!TipoReproduccion) {
                    MySwal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Debes seleccionar el tipo de reproducción' })
                    return
                }

                const todasReprods = await apiAxios.get('/reproducciones/')

                // Buscar reproducción activa de la misma cerda
                const existente = todasReprods.data.find(r =>
                    r.Id_Cerda == Id_Cerda && r.Activo === 'S'
                )

                if (existente) {
                    await MySwal.fire({
                        icon: 'info',
                        title: 'Reproducción activa encontrada',
                        html: `Esta cerda ya tiene una reproducción activa (#${existente.Id_Reproduccion}).<br>Se registrará la nueva <b>${TipoReproduccion}</b> en esa reproducción.`,
                        confirmButtonColor: '#C97A85',
                    })
                    hideModal()
                    if (onReproduccionCreada) {
                        onReproduccionCreada({
                            tipo: TipoReproduccion,
                            Id_Reproduccion: existente.Id_Reproduccion,
                            Id_Porcino: Number(Id_Cerda)
                        })
                    }
                } else {
                    const response = await apiAxios.post('/reproducciones', {
                        Id_Cerda: Number(Id_Cerda),
                        Activo: 'S',
                        TipoReproduccion
                    })
                    const nuevaReproduccion = response.data?.reproducciones || response.data

                    await MySwal.fire({
                        icon: 'success',
                        title: 'Reproducción creada',
                        text: `Ahora completa los datos de ${TipoReproduccion}`
                    })
                    hideModal()
                    if (onReproduccionCreada) {
                        onReproduccionCreada({
                            tipo: TipoReproduccion,
                            Id_Reproduccion: nuevaReproduccion.Id_Reproduccion,
                            Id_Porcino: Number(Id_Cerda)
                        })
                    }
                }

            } else {
                // ── EDITAR REPRODUCCIÓN EXISTENTE ─────────────────────────

                // Si eligió agregar monta o inseminación, abrir el modal encadenado
                if (accionEdicion === 'agregar_monta' || accionEdicion === 'agregar_inseminacion') {
                    const tipo = accionEdicion === 'agregar_monta' ? 'Monta' : 'Inseminacion'
                    hideModal()
                    if (onReproduccionCreada) {
                        onReproduccionCreada({
                            tipo,
                            Id_Reproduccion: Number(Id_Reproduccion),
                            Id_Porcino: Number(Id_Cerda)
                        })
                    }
                    return
                }

                // Solo actualizar estado
                await apiAxios.put(`/reproducciones/${Id_Reproduccion}`, {
                    Id_Cerda: Number(Id_Cerda),
                    Activo,
                    TipoReproduccion: reproduccionEdit.TipoReproduccion
                })
                await MySwal.fire({ icon: 'success', title: 'Éxito', text: 'Reproducción actualizada correctamente' })
                hideModal()
            }

        } catch (error) {
            const mensaje = error.response?.data?.message || error.message
            MySwal.fire({ icon: 'error', title: 'Error', text: mensaje })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            {/* Cerda — solo lectura en edición */}
            <div className="mb-3">
                <label className="form-label">Cerda</label>
                {esEdicion ? (
                    <input
                        type="text"
                        className="form-control"
                        value={reproduccionEdit?.porcino?.Nom_Porcino || ''}
                        disabled
                    />
                ) : (
                    <select className="form-control" value={Id_Cerda}
                        onChange={(e) => setId_Cerda(e.target.value)} required>
                        <option value="">Seleccione...</option>
                        {porcinos.map(p => (
                            <option key={p.Id_Porcino} value={p.Id_Porcino}>{p.Nom_Porcino}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* ── MODO EDICIÓN ─────────────────────────────── */}
            {esEdicion && (
                <>
                    {/* Estado activo/inactivo */}
                    <div className="mb-3">
                        <label className="form-label">Estado</label>
                        <select className="form-control" value={Activo}
                            onChange={(e) => { setActivo(e.target.value); setAccionEdicion('') }}>
                            <option value="S">Activa</option>
                            <option value="N">Inactiva</option>
                        </select>
                    </div>

                    {/* Agregar monta o inseminación */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Agregar registro</label>
                        <div className="d-flex gap-3">

                            {/* Siempre puede agregar montas */}
                            <div
                                onClick={() => setAccionEdicion(accionEdicion === 'agregar_monta' ? '' : 'agregar_monta')}
                                className="border rounded p-3 text-center flex-fill"
                                style={{
                                    cursor: 'pointer',
                                    borderWidth: accionEdicion === 'agregar_monta' ? '2px' : '1px',
                                    borderColor: accionEdicion === 'agregar_monta' ? '#e75480' : '#dee2e6',
                                    backgroundColor: accionEdicion === 'agregar_monta' ? '#fff0f5' : '#fff',
                                    transition: 'all 0.2s'
                                }}>
                                <div style={{ fontSize: 28 }}>🐷</div>
                                <div className="fw-bold mt-1" style={{ color: accionEdicion === 'agregar_monta' ? '#e75480' : '#555' }}>
                                    Monta
                                </div>
                                <small className="text-muted">
                                    {tieneMontas ? `Ya tiene ${reproduccionEdit.montas.length}` : 'Sin montas aún'}
                                </small>
                            </div>

                            {/* Siempre puede agregar inseminaciones */}
                            <div
                                onClick={() => setAccionEdicion(accionEdicion === 'agregar_inseminacion' ? '' : 'agregar_inseminacion')}
                                className="border rounded p-3 text-center flex-fill"
                                style={{
                                    cursor: 'pointer',
                                    borderWidth: accionEdicion === 'agregar_inseminacion' ? '2px' : '1px',
                                    borderColor: accionEdicion === 'agregar_inseminacion' ? '#1e90ff' : '#dee2e6',
                                    backgroundColor: accionEdicion === 'agregar_inseminacion' ? '#f0f6ff' : '#fff',
                                    transition: 'all 0.2s'
                                }}>
                                <div style={{ fontSize: 28 }}>💉</div>
                                <div className="fw-bold mt-1" style={{ color: accionEdicion === 'agregar_inseminacion' ? '#1e90ff' : '#555' }}>
                                    Inseminación
                                </div>
                                <small className="text-muted">
                                    {tieneInseminaciones ? `Ya tiene ${reproduccionEdit.inseminaciones.length}` : 'Sin inseminaciones aún'}
                                </small>
                            </div>
                        </div>

                        {accionEdicion && (
                            <small className="text-success mt-2 d-block">
                                ✅ Se abrirá el formulario para agregar una {accionEdicion === 'agregar_monta' ? 'Monta' : 'Inseminación'} al guardar.
                            </small>
                        )}
                    </div>
                </>
            )}

            {/* ── MODO CREACIÓN ────────────────────────────── */}
            {!esEdicion && (
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Tipo de Reproducción <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-3">
                        <div onClick={() => setTipoReproduccion('Monta')}
                            className="border rounded p-3 text-center flex-fill"
                            style={{
                                cursor: 'pointer',
                                borderWidth: TipoReproduccion === 'Monta' ? '2px' : '1px',
                                borderColor: TipoReproduccion === 'Monta' ? '#e75480' : '#dee2e6',
                                backgroundColor: TipoReproduccion === 'Monta' ? '#fff0f5' : '#fff',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{ fontSize: 28 }}>🐷</div>
                            <div className="fw-bold mt-1" style={{ color: TipoReproduccion === 'Monta' ? '#e75480' : '#555' }}>Monta</div>
                            <small className="text-muted">Natural</small>
                        </div>

                        <div onClick={() => setTipoReproduccion('Inseminacion')}
                            className="border rounded p-3 text-center flex-fill"
                            style={{
                                cursor: 'pointer',
                                borderWidth: TipoReproduccion === 'Inseminacion' ? '2px' : '1px',
                                borderColor: TipoReproduccion === 'Inseminacion' ? '#1e90ff' : '#dee2e6',
                                backgroundColor: TipoReproduccion === 'Inseminacion' ? '#f0f6ff' : '#fff',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{ fontSize: 28 }}>💉</div>
                            <div className="fw-bold mt-1" style={{ color: TipoReproduccion === 'Inseminacion' ? '#1e90ff' : '#555' }}>Inseminación</div>
                            <small className="text-muted">Artificial</small>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-3">
                <input type="submit" className="btn btn-primary w-100" value={textFormButton} />
            </div>

        </form>
    )
}

export default ReproduccionesForm