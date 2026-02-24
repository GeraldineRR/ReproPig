import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MedicamentosForm = ({ hideModal, medicamentoEdit }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Medicamento, setIdMedicamento] = useState('')
    const [Nombre, setNombre] = useState('')
    const [Tipo, setTipo] = useState('')
    const [Presentacion, setPresentacion] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        if (medicamentoEdit) {
            setIdMedicamento(medicamentoEdit.Id_Medicamento ?? '')
            setNombre(medicamentoEdit.Nombre ?? '')
            setTipo(medicamentoEdit.Tipo ?? '')
            setPresentacion(medicamentoEdit.Presentacion ?? '')
            setObservaciones(medicamentoEdit.Observaciones ?? '')
            setTextFormButton("Actualizar")
        } else {
            setIdMedicamento('')
            setNombre('')
            setTipo('')
            setPresentacion('')
            setObservaciones('')
            setTextFormButton("Enviar")
        }
    }, [medicamentoEdit])

    const gestionarForm = async (e) => {
        e.preventDefault()

        const data = {
            Nombre,
            Tipo,
            Presentacion,
            Observaciones
        }

        try {
            if (!medicamentoEdit) {
                await apiAxios.post('/api/medicamentos/', data)
            } else {
                await apiAxios.put(
                    `/api/medicamentos/${medicamentoEdit.Id_Medicamento}`,
                    data
                )
            }

            MySwal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Medicamento guardado correctamente'
            })

            hideModal()

        } catch (error) {
            console.error(error.response?.data || error.message)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el medicamento'
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                    type="text"
                    id="Nombre"
                    className="form-control"
                    value={Nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Tipo</label>
                <select
                    id="Tipo"
                    className="form-control"
                    value={Tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    required>
                    <option value="">Selecciona...</option>
                    <option value="Vacuna">Vacuna</option>
                    <option value="Vitamina">Vitamina</option>
                    <option value="Antibiotico">Antibiotico</option>
                    <option value="Analgesico">Analgesico</option>
                    <option value="Antiparasitario">Antiparasitario</option>
                    <option value="Antiinflamatorio">Antiinflamatorio</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Presentación</label>
                <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={Presentacion}
                    onChange={(e) => setPresentacion(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea
                    className="form-control"
                    value={Observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                />
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

export default MedicamentosForm
