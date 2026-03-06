import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const ReproduccionesForm = ({ hideModal, reproduccionEdit, onReproduccionCreada }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Reproduccion, setId_Reproduccion] = useState('')
    const [Id_Cerda, setId_Cerda] = useState('')
    const [Activo, setActivo] = useState('')
    const [TipoReproduccion, setTipoReproduccion] = useState('')
    const [porcinos, setPorcinos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getPorcinos()
    }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino')
            setPorcinos(response.data)
        } catch (error) {
            console.error("Error al obtener porcinos:", error)
        }
    }

    useEffect(() => {
        if (reproduccionEdit?.Id_Reproduccion) {
            setId_Reproduccion(reproduccionEdit.Id_Reproduccion || '')
            setId_Cerda(reproduccionEdit.Id_Cerda || reproduccionEdit.porcino?.Id_Porcino || '')
            setActivo(reproduccionEdit.Activo || '')
            setTipoReproduccion(reproduccionEdit.TipoReproduccion || '')
            setTextFormButton("Actualizar")
        } else {
            setId_Reproduccion('')
            setId_Cerda('')
            setActivo('')
            setTipoReproduccion('')
            setTextFormButton("Enviar")
        }
    }, [reproduccionEdit?.Id_Reproduccion])

    const handleActivoChange = (valor) => {
        setActivo(valor)
        if (valor !== 'Si') setTipoReproduccion('')
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (Activo === 'Si' && !TipoReproduccion) {
            MySwal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Debes seleccionar el tipo de reproducción (Monta o Inseminación)'
            })
            return
        }

        const data = {
            Id_Cerda: Number(Id_Cerda),
            Activo,
            ...(Activo === 'Si' && { TipoReproduccion })
        }

        try {
            if (textFormButton === 'Enviar') {
                const response = await apiAxios.post('/reproducciones', data)
                const nuevaReproduccion = response.data?.reproducciones || response.data

                await MySwal.fire({
                    icon: 'success',
                    title: 'Reproducción creada',
                    text: TipoReproduccion
                        ? `Ahora completa los datos de ${TipoReproduccion}`
                        : 'Reproducción registrada correctamente'
                })

                hideModal()

                // Abrir modal encadenado al crear
                if (TipoReproduccion && onReproduccionCreada) {
                    onReproduccionCreada({
                        tipo: TipoReproduccion,
                        Id_Reproduccion: nuevaReproduccion.Id_Reproduccion,
                        Id_Porcino: Number(Id_Cerda)
                    })
                }

            } else {
                await apiAxios.put(`/reproducciones/${Id_Reproduccion}`, data)

                await MySwal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: TipoReproduccion
                        ? `Reproducción actualizada. Ahora completa los datos de ${TipoReproduccion}`
                        : 'Reproducción actualizada correctamente'
                })

                hideModal()

                // ✅ También abrir modal encadenado al actualizar
                if (TipoReproduccion && onReproduccionCreada) {
                    onReproduccionCreada({
                        tipo: TipoReproduccion,
                        Id_Reproduccion: Number(Id_Reproduccion),
                        Id_Porcino: Number(Id_Cerda)
                    })
                }
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
                    {porcinos.map(porcino => (
                        <option key={porcino.Id_Porcino} value={porcino.Id_Porcino}>
                            {porcino.Nom_Porcino}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Activo</label>
                <select className="form-control" value={Activo}
                    onChange={(e) => handleActivoChange(e.target.value)} required>
                    <option value="">Seleccione...</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                </select>
            </div>

            {Activo === 'Si' && (
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
                            <div className="fw-bold mt-1" style={{ color: TipoReproduccion === 'Monta' ? '#e75480' : '#555' }}>
                                Monta
                            </div>
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
                            <div className="fw-bold mt-1" style={{ color: TipoReproduccion === 'Inseminacion' ? '#1e90ff' : '#555' }}>
                                Inseminación
                            </div>
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