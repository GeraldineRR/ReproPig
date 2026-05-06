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
    const [Id_Reproduccion, setId_Reproduccion] = useState('')

    const [porcinos, setPorcinos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [reproduccionesActivas, setReproduccionesActivas] = useState([])

    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getPorcinos()
        getResponsables()
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
            setId_Reproduccion(Seguimiento_CerdaEdit.Id_Reproduccion ?? '')
            setTextFormButton("Actualizar")

            // Cargar reproducciones de esa cerda para edición
            if (Seguimiento_CerdaEdit.Id_Porcino) {
                getReproduccionesActivas(Seguimiento_CerdaEdit.Id_Porcino)
            }
        } else {
            setId_Seguimiento_Cerda('')
            setFecha('')
            setHora('')
            setObservaciones('')
            setId_Porcino('')
            setId_Responsable('')
            setId_Medicamento('')
            setId_Reproduccion('')
            setReproduccionesActivas([])
            setTextFormButton("Enviar")
        }
    }, [Seguimiento_CerdaEdit])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino/')
            // Solo hembras
            setPorcinos(response.data.filter(p => p.Gen_Porcino === 'H'))
        } catch (error) {
            console.error('Error obteniendo porcinos:', error)
            setPorcinos([])
        }
    }

    const getResponsables = async () => {
        try {
            const responsables = await apiAxios.get('/responsables/')
            setResponsables(responsables.data)
        } catch (error) {
            console.error('Error obteniendo responsables:', error)
            setResponsables([])
        }
    }

    const getMedicamentos = async () => {
        try {
            const medicamentos = await apiAxios.get('/medicamentos/')
            setMedicamentos(medicamentos.data)
        } catch (error) {
            console.error('Error obteniendo medicamentos:', error)
            setMedicamentos([])
        }
    }

    const getReproduccionesActivas = async (idPorcino) => {
        if (!idPorcino) { setReproduccionesActivas([]); return }
        try {
            const response = await apiAxios.get('/reproducciones/')
            const activas = response.data.filter(r =>
                r.Id_Cerda == idPorcino && r.Activo === 'S'
            )
            setReproduccionesActivas(activas)
        } catch (error) {
            console.error('Error obteniendo reproducciones:', error)
            setReproduccionesActivas([])
        }
    }

    const handlePorcinoChange = (e) => {
        const val = e.target.value
        setId_Porcino(val)
        setId_Reproduccion('')
        getReproduccionesActivas(val)
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        const data = {
            Fecha,
            Hora,
            Observaciones,
            Id_Porcino,
            Id_Responsable,
            Id_Medicamento,
            Id_Reproduccion: Id_Reproduccion || null
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/Seguimiento_Cerda/', data)
            } else {
                await apiAxios.put(
                    `/Seguimiento_Cerda/${Id_Seguimiento_Cerda}`,
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

            <div className="text-center mb-4">
                <h5 className="fw-bold">📋 Seguimiento de Cerda</h5>
                <small className="text-muted">Registro vinculado al ciclo reproductivo</small>
            </div>

            <div className="row g-3">

                {/* FECHA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha</label>
                    <input
                        type="date"
                        className="form-control shadow-sm"
                        value={Fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                    />
                </div>

                {/* HORA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🕐 Hora</label>
                    <input
                        type="time"
                        className="form-control shadow-sm"
                        value={Hora}
                        onChange={(e) => setHora(e.target.value)}
                        required
                    />
                </div>

                {/* CERDA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🐷 Cerda</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Porcino}
                        onChange={handlePorcinoChange}
                        required
                    >
                        <option value="">Seleccione una cerda</option>
                        {porcinos.map((porcino) => (
                            <option key={porcino.Id_Porcino} value={porcino.Id_Porcino}>
                                {porcino.Nom_Porcino}
                            </option>
                        ))}
                    </select>
                </div>

                {/* REPRODUCCIÓN ACTIVA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🔁 Reproducción</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Reproduccion}
                        onChange={(e) => setId_Reproduccion(e.target.value)}
                    >
                        <option value="">
                            {!Id_Porcino
                                ? 'Primero seleccione una cerda'
                                : reproduccionesActivas.length === 0
                                    ? 'Sin reproducciones activas'
                                    : 'Seleccione una reproducción'}
                        </option>
                        {reproduccionesActivas.map(r => (
                            <option key={r.Id_Reproduccion} value={r.Id_Reproduccion}>
                                #{r.Id_Reproduccion} — {r.TipoReproduccion}
                            </option>
                        ))}
                    </select>
                </div>

                {/* RESPONSABLE */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">👨‍🌾 Responsable</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Responsable}
                        onChange={(e) => setId_Responsable(e.target.value)}
                        required
                    >
                        <option value="">Seleccione</option>
                        {responsables.map((responsable) => (
                            <option key={responsable.Id_Responsable} value={responsable.Id_Responsable}>
                                {responsable.Nombres} {responsable.Apellidos}
                            </option>
                        ))}
                    </select>
                </div>

                {/* MEDICAMENTO */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">💊 Medicamento</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Medicamento}
                        onChange={(e) => setId_Medicamento(e.target.value)}
                        required
                    >
                        <option value="">Seleccione</option>
                        {medicamentos.map((medicamento) => (
                            <option key={medicamento.Id_Medicamento} value={medicamento.Id_Medicamento}>
                                {medicamento.Nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* OBSERVACIONES */}
                <div className="col-12">
                    <label className="form-label fw-semibold">📝 Observaciones</label>
                    <textarea
                        className="form-control shadow-sm"
                        value={Observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows="2"
                    />
                </div>

            </div>

            {/* BOTÓN */}
            <div className="d-grid mt-4">
                <button className="btn btn-primary fw-semibold py-2 shadow-sm">
                    {textFormButton}
                </button>
            </div>

        </form>
    )
}

export default Seguimiento_CerdaForm