import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const ReproduccionesForm = ({ hideModal, reproduccionEdit }) => {

    const MySwal = withReactContent(Swal)
    const navigate = useNavigate()

    const [Id_Reproduccion, setId_Reproduccion] = useState('')
    const [Id_Cerda, setId_Cerda] = useState('')
    const [Activo, setActivo] = useState('')
    const [TipoReproduccion, setTipoReproduccion] = useState('')
    const [porcinos, setPorcinos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    // Traer porcinos desde la API
    useEffect(() => {
        const getPorcinos = async () => {
            try {
                const response = await apiAxios.get('/api/porcino')
                setPorcinos(response.data)
            } catch (error) {
                console.error("Error al obtener porcinos:", error)
            }
        }
        getPorcinos()
    }, [])

    // Cargar datos cuando se edita
    useEffect(() => {
        if (reproduccionEdit) {
            setId_Reproduccion(reproduccionEdit.Id_Reproduccion || '')
            setId_Cerda(reproduccionEdit.Id_Cerda || '')
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
    }, [reproduccionEdit])

    // Si cambia Activo a "No", limpiar el tipo
    const handleActivoChange = (valor) => {
        setActivo(valor)
        if (valor !== 'Si') setTipoReproduccion('')
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        // Validar que seleccione tipo si está activo
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
                await apiAxios.post('/api/reproducciones', data)
            } else {
                await apiAxios.put(`/api/reproducciones/${Id_Reproduccion}`, data)
            }

            // Determinar ruta destino según el tipo
            const rutaDestino = TipoReproduccion === 'Monta'
                ? '/montas'
                : TipoReproduccion === 'Inseminacion'
                ? '/inseminaciones'
                : null

            await MySwal.fire({
                icon: 'success',
                title: 'Éxito',
                text: reproduccionEdit
                    ? 'Reproducción actualizada correctamente'
                    : 'Reproducción creada correctamente'
            })

            hideModal()

            // Redirigir automáticamente al módulo correspondiente
            if (rutaDestino) {
                navigate(rutaDestino)
            }

        } catch (error) {
            console.error(error.response?.data || error.message)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la reproducción'
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            {/* Cerda */}
            <div className="mb-3">
                <label className="form-label">Cerda</label>
                <select
                    className="form-control"
                    value={Id_Cerda || ""}
                    onChange={(e) => setId_Cerda(e.target.value)}
                    required
                >
                    <option value="">Seleccione...</option>
                    {porcinos.map(porcino => (
                        <option
                            key={porcino.Id_Porcino}
                            value={porcino.Id_Porcino}
                        >
                            {porcino.Nom_Porcino}
                        </option>
                    ))}
                </select>
            </div>

            {/* Activo */}
            <div className="mb-3">
                <label className="form-label">Activo</label>
                <select
                    className="form-control"
                    value={Activo || ""}
                    onChange={(e) => handleActivoChange(e.target.value)}
                    required
                >
                    <option value="">Seleccione...</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                </select>
            </div>

            {/* Tipo de Reproducción — solo aparece si Activo = Si */}
            {Activo === 'Si' && (
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Tipo de Reproducción <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-3">

                        {/* Monta */}
                        <div
                            onClick={() => setTipoReproduccion('Monta')}
                            className="border rounded p-3 text-center flex-fill"
                            style={{
                                cursor: 'pointer',
                                borderStyle: 'solid',
                                borderWidth: TipoReproduccion === 'Monta' ? '2px' : '1px',
                                borderColor: TipoReproduccion === 'Monta' ? '#e75480' : '#dee2e6',
                                backgroundColor: TipoReproduccion === 'Monta' ? '#fff0f5' : '#fff',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: 28 }}>🐷</div>
                            <div className="fw-bold mt-1"
                                style={{ color: TipoReproduccion === 'Monta' ? '#e75480' : '#555' }}>
                                Monta
                            </div>
                            <small className="text-muted">Natural</small>
                        </div>

                        {/* Inseminación */}
                        <div
                            onClick={() => setTipoReproduccion('Inseminacion')}
                            className="border rounded p-3 text-center flex-fill"
                            style={{
                                cursor: 'pointer',
                                borderStyle: 'solid',
                                borderWidth: TipoReproduccion === 'Inseminacion' ? '2px' : '1px',
                                borderColor: TipoReproduccion === 'Inseminacion' ? '#1e90ff' : '#dee2e6',
                                backgroundColor: TipoReproduccion === 'Inseminacion' ? '#f0f6ff' : '#fff',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: 28 }}>💉</div>
                            <div className="fw-bold mt-1"
                                style={{ color: TipoReproduccion === 'Inseminacion' ? '#1e90ff' : '#555' }}>
                                Inseminación
                            </div>
                            <small className="text-muted">Artificial</small>
                        </div>

                    </div>
                </div>
            )}

            {/* Botón */}
            <div className="mb-3">
                <input
                    type="submit"
                    className="btn btn-primary w-100"
                    value={textFormButton}
                />
            </div>

        </form>
    )
}

export default ReproduccionesForm