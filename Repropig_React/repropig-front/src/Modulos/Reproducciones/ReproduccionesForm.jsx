import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const ReproduccionesForm = ({ hideModal, reproduccionEdit, onReproduccionCreada }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Reproduccion, setId_Reproduccion] = useState('')
    const [Id_Cerda, setId_Cerda] = useState('')
    const [Activo, setActivo] = useState('Si')
    const [TipoReproduccion, setTipoReproduccion] = useState('')
    const [porcinos, setPorcinos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const esEdicion = !!reproduccionEdit?.Id_Reproduccion

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
            setActivo(reproduccionEdit.Activo || 'Si')
            setTipoReproduccion(reproduccionEdit.TipoReproduccion || '')
            setTextFormButton("Actualizar")
        } else {
            setId_Reproduccion('')
            setId_Cerda('')
            setActivo('Si')
            setTipoReproduccion('')
            setTextFormButton("Enviar")
        }
    }, [reproduccionEdit?.Id_Reproduccion])

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (!TipoReproduccion && !esEdicion) {
            MySwal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Debes seleccionar el tipo de reproducción' })
            return
        }

        try {
            if (!esEdicion) {
                const todasReprods = await apiAxios.get('/reproducciones/')

                // ✅ Buscar reproducción activa de la misma cerda SIN importar el tipo
                const existente = todasReprods.data.find(r =>
                    r.Id_Cerda == Id_Cerda &&
                    r.Activo === 'Si'
                )

                if (existente) {
                    // ✅ Ya existe — usar la misma reproducción
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
                    // No existe — crear nueva
                    const response = await apiAxios.post('/reproducciones', {
                        Id_Cerda: Number(Id_Cerda),
                        Activo: 'Si',
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

            <div className="mb-3">
                <label className="form-label">Cerda</label>
                <select className="form-control" value={Id_Cerda}
                    onChange={(e) => setId_Cerda(e.target.value)} required>
                    <option value="">Seleccione...</option>
                    {porcinos.map(p => (
                        <option key={p.Id_Porcino} value={p.Id_Porcino}>{p.Nom_Porcino}</option>
                    ))}
                </select>
            </div>

            {esEdicion && (
                <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select className="form-control" value={Activo}
                        onChange={(e) => setActivo(e.target.value)} required>
                        <option value="Si">Activa</option>
                        <option value="No">Inactiva</option>
                    </select>
                    <small className="text-muted">El tipo de reproducción no se puede cambiar una vez creada.</small>
                </div>
            )}

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