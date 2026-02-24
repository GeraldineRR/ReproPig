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
    
    const [porcinos, setPorcinos] = useState([])
    const [Responsables, setResponsables] = useState([])
    
    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getPorcinos()
    }, [])

    useEffect(() => {
        getResponsable()
    }, [])

    useEffect(() => {
        if (Seguimiento_CerdaEdit) {
            setId_Seguimiento_Cerda(Seguimiento_CerdaEdit.Id_Seguimiento_Cerda ?? '')
            setFecha(Seguimiento_CerdaEdit.Fecha ?? '')
            setHora(Seguimiento_CerdaEdit.Hora ?? '')
            setObservaciones(Seguimiento_CerdaEdit.Observaciones ?? '')
            setId_Porcino(Seguimiento_CerdaEdit.Id_Porcino ?? '')
            setId_Responsable(Seguimiento_CerdaEdit.Id_Responsable ?? '')
            setTextFormButton("Actualizar")
        } else {
            setId_Seguimiento_Cerda('')
            setFecha('')
            setHora('')
            setObservaciones('')
            setId_Porcino('')
            setId_Responsable('')
            setTextFormButton("Enviar")
        }
    }, [Seguimiento_CerdaEdit])

    const getPorcinos = async () => {
        try {
            const porcinos = await apiAxios.get('/api/porcino/')
            setPorcinos(porcinos.data)
            console.log(porcinos.data)
        } catch (error) {
            console.error('Error obteniendo porcinos:', error)
            setPorcinos([])
        }
    }

    const getResponsable = async () => {
        try {
            const responsables = await apiAxios.get('/api/responsables/')
            setResponsables(responsables.data)
            console.log('Responsables:', responsables.data)
        } catch (error) {
            console.error('Error obteniendo responsables:', error)
            setResponsables([])
        }
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        const data = {
            Fecha,
            Hora,
            Observaciones,
            Id_Porcino,
            Id_Responsable
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
                    {Responsables.map((responsable) => (
                        <option key={responsable.id_responsable} value={responsable.id_responsable}>
                            {responsable.Nombres} {responsable.Apellidos}
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