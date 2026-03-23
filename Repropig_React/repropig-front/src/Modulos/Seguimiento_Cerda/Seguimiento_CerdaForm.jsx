import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Seguimiento_CerdaForm = ({ hideModal, Seguimiento_CerdaEdit, reload }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Seguimiento_Cerda, setId_Seguimiento_Cerda] = useState('')
    const [Fecha, setFecha] = useState('')
    const [Hora, setHora] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [Id_Porcino, setId_Porcino] = useState('')
    const [Id_Responsable, setId_Responsable] = useState('')
    const [Id_Medicamento, setId_Medicamento] = useState('')
    
    const [porcinos, setPorcinos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    
    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getPorcinos()
    }, [])

    useEffect(() => {
        getResponsables()
    }, [])

    useEffect(() => {
        getMedicamentos()
    }, [])

    useEffect(() => {
        if (Seguimiento_CerdaEdit) {
            setId_Seguimiento_Cerda(Seguimiento_CerdaEdit.Id_Seguimiento_Cerda ?? '')
            setFecha(Seguimiento_CerdaEdit.Fecha ?? '')
            setHora(Seguimiento_CerdaEdit.Hora ?? '')
            setObservaciones(Seguimiento_CerdaEdit.Observaciones ?? '')
            setId_Porcino(Seguimiento_CerdaEdit.Id_Porcino ?? '')
            setId_Responsable(Seguimiento_CerdaEdit.Id_Responsable ?? '')
            setId_Medicamento(Seguimiento_CerdaEdit.Id_Medicamento ?? '')
            setTextFormButton("Actualizar")
        } else {
            setId_Seguimiento_Cerda('')
            setFecha('')
            setHora('')
            setObservaciones('')
            setId_Porcino('')
            setId_Responsable('')
            setId_Medicamento('')
            setTextFormButton("Enviar")
        }
    }, [Seguimiento_CerdaEdit])

    const getPorcinos = async () => {
        try {
            const porcinos = await apiAxios.get('/api/Porcino/')
            setPorcinos(porcinos.data)
            console.log(porcinos.data)
        } catch (error) {
            console.error('Error obteniendo porcinos:', error)
            setPorcinos([])
        }
    }

    const getResponsables = async () => {
        try {
            const responsables = await apiAxios.get('/api/responsables/')
            setResponsables(responsables.data)
            console.log('Responsables:', responsables.data)
        } catch (error) {
            console.error('Error obteniendo responsables:', error)
            setResponsables([])
        }
    }

    const getMedicamentos = async () => {
        try {
            const medicamentos = await apiAxios.get('/api/medicamentos/')
            setMedicamentos(medicamentos.data)
            console.log('Medicamentos:', medicamentos.data)
        } catch (error) {
            console.error('Error obteniendo medicamentos:', error)
            setMedicamentos([])
        }
    }
    const gestionarForm = async (e) => {
        e.preventDefault()

        const data = {
            Fecha,
            Hora,
            Observaciones,
            Id_Porcino,
            Id_Responsable,
            Id_Medicamento
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/api/Seguimiento_Cerda/', data)
            } else {
                await apiAxios.put(
                    `/api/Seguimiento_Cerda/${Id_Seguimiento_Cerda}`,
                    data
                )
            }

            MySwal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Seguimiento guardado correctamente'
            })

            hideModal()
            if (reload) reload()

        } catch (error) {
            console.error(error.response?.data || error.message)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el Seguimiento'
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

           
            <div className="mb-3">
                <label htmlFor="Fecha" className="form-label">Fecha</label>
                <input 
                    type="date" 
                    id="Fecha" 
                    className="form-control" 
                    value={Fecha} 
                    onChange={(e) => setFecha(e.target.value)} 
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="Hora" className="form-label">Hora</label>
                <input 
                    type="time" 
                    id="Hora" 
                    className="form-control" 
                    value={Hora} 
                    onChange={(e) => setHora(e.target.value)} 
                    required
                />
            </div>

          
            <div className="mb-3">
                <label htmlFor="Observaciones" className="form-label">Observaciones</label>
                <textarea 
                    id="Observaciones" 
                    className="form-control" 
                    value={Observaciones} 
                    onChange={(e) => setObservaciones(e.target.value)} 
                    rows="3"
                />
            </div>

         
            <div className="mb-3">
                <label htmlFor="Id_Porcino" className="form-label">Porcino</label>
                <select 
                    id="Id_Porcino" 
                    className="form-control" 
                    value={Id_Porcino} 
                    onChange={(e) => setId_Porcino(e.target.value)} 
                    required
                >
                    <option value="">Selecciona...</option>
                    {porcinos.map((porcino) => (
                        <option key={porcino.Id_Porcino} value={porcino.Id_Porcino}>
                            {porcino.Nom_Porcino}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="Id_Responsable" className="form-label">Responsable</label>
                <select 
                    id="Id_Responsable" 
                    className="form-control" 
                    value={Id_Responsable} 
                    onChange={(e) => setId_Responsable(e.target.value)} 
                    required
                >
                    <option value="">Selecciona...</option>
                    {responsables.map((responsable) => (
                        <option key={responsable.Id_Responsable} value={responsable.Id_Responsable}>
                            {responsable.Nombres} {responsable.Apellidos}
                        </option>
                        ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="Id_Medicamento" className="form-label">Medicamento</label>
                <select 
                    id="Id_Medicamento" 
                    className="form-control" 
                    value={Id_Medicamento} 
                    onChange={(e) => setId_Medicamento(e.target.value)} 
                    required
                >
                    <option value="">Selecciona...</option>
                    {medicamentos.map((medicamento) => (
                        <option key={medicamento.Id_Medicamento} value={medicamento.Id_Medicamento}>
                            {medicamento.Nombre}
                        </option>
                        ))}
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

export default Seguimiento_CerdaForm