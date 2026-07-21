import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const CiclosForm = ({ hideModal, cicloEdit, onCicloCreada }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Ciclo, setId_Ciclo] = useState('')
    const [Id_Cerda, setId_Cerda] = useState('')
    const [Activo, setActivo] = useState('S')
<<<<<<< HEAD:Repropig_React/repropig-front/src/Modulos/Reproducciones/ReproduccionesForm.jsx
    const [TipoReproduccion, setTipoReproduccion] = useState('')
    const [Fec_servicio, setFec_servicio] = useState('')
=======
    const [TipoCiclo, setTipoCiclo] = useState('')
>>>>>>> 5a0c75096e67e3b037cfc3d8d69627148b93c807:Repropig_React/repropig-front/src/Modulos/Ciclos/CiclosForm.jsx
    const [accionEdicion, setAccionEdicion] = useState('') // 'agregar_monta' | 'agregar_inseminacion' | ''
    const [porcinos, setPorcinos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const esEdicion = !!cicloEdit?.Id_Ciclo

    // Qué tipos ya tiene este ciclo
    const tieneMontas = cicloEdit?.montas?.length > 0
    const tieneInseminaciones = cicloEdit?.inseminaciones?.length > 0

    useEffect(() => { getPorcinos() }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino')
            setPorcinos(response.data.filter(p => p.Gen_Porcino === 'H'))
        } catch (error) { console.error("Error al obtener porcinos:", error) }
    }

    useEffect(() => {
<<<<<<< HEAD:Repropig_React/repropig-front/src/Modulos/Reproducciones/ReproduccionesForm.jsx
        if (reproduccionEdit?.Id_Reproduccion) {
            setId_Reproduccion(reproduccionEdit.Id_Reproduccion || '')
            setId_Cerda(reproduccionEdit.Id_Cerda || reproduccionEdit.porcino?.Id_Porcino || '')
            setActivo((reproduccionEdit.activo || 'S').toUpperCase())
            setTipoReproduccion(reproduccionEdit.TipoReproduccion || '')
            setFec_servicio(reproduccionEdit.Fec_servicio ? reproduccionEdit.Fec_servicio.split('T')[0] : '')
=======
        if (cicloEdit?.Id_Ciclo) {
            setId_Ciclo(cicloEdit.Id_Ciclo || '')
            setId_Cerda(cicloEdit.Id_Cerda || cicloEdit.porcino?.Id_Porcino || '')
            setActivo((cicloEdit.activo || 'S').toUpperCase())
            setTipoCiclo(cicloEdit.TipoCiclo || '')
>>>>>>> 5a0c75096e67e3b037cfc3d8d69627148b93c807:Repropig_React/repropig-front/src/Modulos/Ciclos/CiclosForm.jsx
            setAccionEdicion('')
            setTextFormButton("Actualizar")
        } else {
            setId_Ciclo('')
            setId_Cerda('')
            setActivo('S')
<<<<<<< HEAD:Repropig_React/repropig-front/src/Modulos/Reproducciones/ReproduccionesForm.jsx
            setTipoReproduccion('')
            setFec_servicio('')
=======
            setTipoCiclo('')
>>>>>>> 5a0c75096e67e3b037cfc3d8d69627148b93c807:Repropig_React/repropig-front/src/Modulos/Ciclos/CiclosForm.jsx
            setAccionEdicion('')
            setTextFormButton("Enviar")
        }
    }, [cicloEdit?.Id_Ciclo])

    const cleanId = (id) => String(id || '').replace(/^:+/, '')

    const gestionarForm = async (e) => {
        e.preventDefault()

        try {
            if (!esEdicion) {
                // ── CREAR NUEVO CICLO ──────────────────────────────
                if (!TipoCiclo) {
                    MySwal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Debes seleccionar el tipo de ciclo' })
                    return
                }

                const todosCiclos = await apiAxios.get('/ciclos/')

                // Buscar ciclo activo de la misma cerda
                const existente = todosCiclos.data.find(r =>
                    String(r.Id_Cerda) === String(Id_Cerda) && (r.activo || '').toUpperCase() === 'S'
                )

                if (existente) {
                    await MySwal.fire({
                        icon: 'info',
                        title: 'Ciclo activo encontrado',
                        html: `Esta cerda ya tiene un ciclo activo (#${existente.Id_Ciclo}).<br>Se registrará la nueva <b>${TipoCiclo}</b> en ese ciclo.`,
                        confirmButtonColor: '#C97A85',
                    })
                    hideModal()
                    if (onCicloCreada) {
                        onCicloCreada({
                            tipo: TipoCiclo,
                            Id_Ciclo: existente.Id_Ciclo,
                            Id_Porcino: Number(Id_Cerda)
                        })
                    }
                } else {
                    const response = await apiAxios.post('/ciclos', {
                        Id_Cerda: Number(Id_Cerda),
                        Activo: 'S',
<<<<<<< HEAD:Repropig_React/repropig-front/src/Modulos/Reproducciones/ReproduccionesForm.jsx
                        TipoReproduccion,
                        Fec_servicio: Fec_servicio || null
=======
                        TipoCiclo
>>>>>>> 5a0c75096e67e3b037cfc3d8d69627148b93c807:Repropig_React/repropig-front/src/Modulos/Ciclos/CiclosForm.jsx
                    })
                    const nuevaCiclo = response.data?.ciclos || response.data

                    await MySwal.fire({
                        icon: 'success',
                        title: 'Ciclo creado',
                        text: `Ahora completa los datos de ${TipoCiclo}`
                    })
                    hideModal()
                    if (onCicloCreada) {
                        onCicloCreada({
                            tipo: TipoCiclo,
                            Id_Ciclo: nuevaCiclo.Id_Ciclo,
                            Id_Porcino: Number(Id_Cerda)
                        })
                    }
                }

            } else {
                // ── EDITAR CICLO EXISTENTE ─────────────────────────

                // Si eligió agregar monta o inseminación, abrir el modal encadenado
                if (accionEdicion === 'agregar_monta' || accionEdicion === 'agregar_inseminacion') {
                    const tipo = accionEdicion === 'agregar_monta' ? 'Monta' : 'Inseminacion'
                    hideModal()
                    if (onCicloCreada) {
                        onCicloCreada({
                            tipo,
                            Id_Ciclo: Number(Id_Ciclo),
                            Id_Porcino: Number(Id_Cerda)
                        })
                    }
                    return
                }

                const sanitizedId = cleanId(Id_Ciclo)
                if (!sanitizedId) {
                    throw new Error('Id de ciclo inválido')
                }
                // Solo actualizar estado
                await apiAxios.put(`/ciclos/${sanitizedId}`, {
                    Id_Cerda: Number(Id_Cerda),
                    Activo,
<<<<<<< HEAD:Repropig_React/repropig-front/src/Modulos/Reproducciones/ReproduccionesForm.jsx
                    TipoReproduccion: reproduccionEdit.TipoReproduccion,
                    Fec_servicio: Fec_servicio || null
=======
                    TipoCiclo: cicloEdit.TipoCiclo
>>>>>>> 5a0c75096e67e3b037cfc3d8d69627148b93c807:Repropig_React/repropig-front/src/Modulos/Ciclos/CiclosForm.jsx
                })
                await MySwal.fire({ icon: 'success', title: 'Éxito', text: 'Ciclo actualizado correctamente' })
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
                        value={cicloEdit?.porcino?.Nom_Porcino || ''}
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

            {/* Fecha de servicio */}
            <div className="mb-3">
                <label className="form-label">Fecha de Servicio</label>
                <input
                    type="date"
                    className="form-control"
                    value={Fec_servicio}
                    onChange={(e) => setFec_servicio(e.target.value)}
                />
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
                                    {tieneMontas ? `Ya tiene ${cicloEdit.montas.length}` : 'Sin montas aún'}
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
                                    {tieneInseminaciones ? `Ya tiene ${cicloEdit.inseminaciones.length}` : 'Sin inseminaciones aún'}
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
                        Tipo de Ciclo <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-3">
                        <div onClick={() => setTipoCiclo('Monta')}
                            className="border rounded p-3 text-center flex-fill"
                            style={{
                                cursor: 'pointer',
                                borderWidth: TipoCiclo === 'Monta' ? '2px' : '1px',
                                borderColor: TipoCiclo === 'Monta' ? '#e75480' : '#dee2e6',
                                backgroundColor: TipoCiclo === 'Monta' ? '#fff0f5' : '#fff',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{ fontSize: 28 }}>🐷</div>
                            <div className="fw-bold mt-1" style={{ color: TipoCiclo === 'Monta' ? '#e75480' : '#555' }}>Monta</div>
                            <small className="text-muted">Natural</small>
                        </div>

                        <div onClick={() => setTipoCiclo('Inseminacion')}
                            className="border rounded p-3 text-center flex-fill"
                            style={{
                                cursor: 'pointer',
                                borderWidth: TipoCiclo === 'Inseminacion' ? '2px' : '1px',
                                borderColor: TipoCiclo === 'Inseminacion' ? '#1e90ff' : '#dee2e6',
                                backgroundColor: TipoCiclo === 'Inseminacion' ? '#f0f6ff' : '#fff',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{ fontSize: 28 }}>💉</div>
                            <div className="fw-bold mt-1" style={{ color: TipoCiclo === 'Inseminacion' ? '#1e90ff' : '#555' }}>Inseminación</div>
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

export default CiclosForm