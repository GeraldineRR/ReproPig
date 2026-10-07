import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MedicamentosForm = ({ hideModal, medicamentoEdit }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Medicamento, setIdMedicamento] = useState('')
    const [Nombre, setNombre] = useState('')
    const [Tipo, setTipo] = useState('')
    const [Presentacion, setPresentacion] = useState('')
    const [Cantidad, setCantidad] = useState('')
    const [Unidad_Medida, setUnidadMedida] = useState('')
    const [Precio_Unitario, setPrecioUnitario] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        if (medicamentoEdit) {
            setIdMedicamento(medicamentoEdit.Id_Medicamento ?? '')
            setNombre(medicamentoEdit.Nombre ?? '')
            setTipo(medicamentoEdit.Tipo ?? '')
            setPresentacion(medicamentoEdit.Presentacion ?? '')
            setCantidad(medicamentoEdit.Cantidad ?? '')
            setUnidadMedida(medicamentoEdit.Unidad_Medida ?? '')
            setPrecioUnitario(medicamentoEdit.Precio_Unitario ?? '')
            setObservaciones(medicamentoEdit.Observaciones ?? '')
            setTextFormButton("Actualizar")
        } else {
            setIdMedicamento('')
            setNombre('')
            setTipo('')
            setPresentacion('')
            setCantidad('')
            setUnidadMedida('')
            setPrecioUnitario('')
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
            Cantidad: Cantidad !== '' ? Number(Cantidad) : null,
            Unidad_Medida: Unidad_Medida || null,
            Precio_Unitario: Precio_Unitario !== '' ? Number(Precio_Unitario) : null,
            Observaciones
        }

        try {
            if (!medicamentoEdit) {
                await apiAxios.post('/medicamentos/', data)
            } else {
                await apiAxios.put(
                    `/medicamentos/${medicamentoEdit.Id_Medicamento}`,
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

            <div className="text-center mb-4">
                <h5 className="fw-bold">💊 {medicamentoEdit ? 'Editar Medicamento' : 'Registrar Medicamento'}</h5>
                <small className="text-muted">Gestión de salud</small>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">🏷️ Nombre</label>
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
                <label className="form-label fw-semibold">📋 Tipo</label>
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
                <label className="form-label fw-semibold">📦 Presentación (ml/gr)</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Frasco x 100 ml"
                    value={Presentacion}
                    onChange={(e) => setPresentacion(e.target.value)}
                    required
                />
            </div>

            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Cantidad</label>
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={Cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Unidad de Medida</label>
                    <select
                        className="form-control"
                        value={Unidad_Medida}
                        onChange={(e) => setUnidadMedida(e.target.value)}
                    >
                        <option value="">Selecciona...</option>
                        <option value="ml">ml (Mililitros)</option>
                        <option value="L">L (Litros)</option>
                        <option value="mg">mg (Miligramos)</option>
                        <option value="g">g (Gramos)</option>
                        <option value="kg">kg (Kilos)</option>
                        <option value="Dosis">Dosis</option>
                        <option value="Frasco">Frasco</option>
                        <option value="Caja">Caja</option>
                        <option value="Ampolla">Ampolla</option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Precio Unitario ($)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej. 25000"
                    className="form-control"
                    value={Precio_Unitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">📝 Observaciones</label>
                <textarea
                    className="form-control"
                    value={Observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <input
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                    value={textFormButton}
                />
            </div>

        </form>
    )
}

export default MedicamentosForm
