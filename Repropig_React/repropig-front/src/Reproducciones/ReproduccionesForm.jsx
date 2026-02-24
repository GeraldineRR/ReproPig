import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ReproduccionesForm = ({ hideModal, reproduccionEdit }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Reproduccion, setId_Reproduccion] = useState('')
    const [Id_Cerda, setId_Cerda] = useState('')
    const [Activo, setActivo] = useState('')
    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        if (reproduccionEdit) {
            setId_Reproduccion(reproduccionEdit.Id_Reproduccion ?? '')
            setId_Cerda(reproduccionEdit.Id_Cerda ?? '')
            setActivo(reproduccionEdit.Activo ?? '')
            setTextFormButton("Actualizar")
        } else {
            setId_Reproduccion('')
            setId_Cerda('')
            setActivo('')
            setTextFormButton("Enviar")
        }
    }, [reproduccionEdit])

    const gestionarForm = async (e) => {
        e.preventDefault()

        const data = {
            Id_Cerda,
            Activo
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/api/reproducciones/', data)
            } else {
                await apiAxios.put(
                    `/api/reproducciones/${Id_Reproduccion}`,
                    data
                )
            }

            MySwal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Reproducción guardada correctamente'
            })

            hideModal()

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

            <div className="mb-3">
                <label className="form-label">Id Cerda</label>
                <select
                    className="form-control"
                    value={Id_Cerda}
                    onChange={(e) => setId_Cerda(e.target.value)}
                    required
                >
                    <option value="">Seleccione...</option>
                    <option value="Petra">Petra</option>
                    <option value="Whisky">Whisky</option>
                    <option value="Maxima">Maxima</option>
                    <option value="Chancha">Chancha</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Activo</label>
                <select
                    className="form-control"
                    value={Activo}
                    onChange={(e) => setActivo(e.target.value)}
                    required
                >
                    <option value="">Seleccione...</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div className="mb-3">
                <input
                    type="submit"
                    className="btn btn-primary"
                    value={textFormButton}
                />
            </div>

        </form>
    )
}

export default ReproduccionesForm
