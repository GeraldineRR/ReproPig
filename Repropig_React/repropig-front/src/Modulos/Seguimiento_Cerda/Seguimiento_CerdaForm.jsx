import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Seguimiento_CerdaForm = ({ hideModal, Seguimiento_CerdaEdit, reload, partoIdParams }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Seguimiento_Cerda, setId_Seguimiento_Cerda] = useState('')
    const [Id_parto, setIdParto] = useState('')
    const [Dia_Programado, setDiaProgramado] = useState('')
    const [Fecha_Programada, setFechaProgramada] = useState('')
    const [Fecha_Real, setFechaReal] = useState('')
    const [Id_Responsable, setId_Responsable] = useState('')
    const [Id_Medicamento, setId_Medicamento] = useState('')
    const [Observaciones, setObservaciones] = useState('')

    const [partos, setPartos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [medicamentos, setMedicamentos] = useState([])

    const [partoConfirmado, setPartoConfirmado] = useState(false)
    const [modoCorreccion, setModoCorreccion] = useState(false)
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const diasSeguimiento = [1, 3, 5, 7, 10, 14, 21, 28]

    // Calcula fecha programada según día y fecha del parto
    function calcularFechaProgramada(fechaParto, dia) {
        if (!fechaParto) return ''
        const [year, month, day] = fechaParto.split('T')[0].split('-')
        const fecha = new Date(year, month - 1, parseInt(day) + (dia - 1))
        return fecha.toISOString().split('T')[0]
    }

    // Obtiene el siguiente día programado basado en registros existentes
    const actualizarDiaYFecha = async (idPartoVal) => {
        if (!idPartoVal) return

        try {
            // Trae los registros de seguimiento ya guardados para esta cerda/parto
            const response = await apiAxios.get(`/Seguimiento_Cerda/parto/${idPartoVal}`)
            const registros = response.data

            // Encuentra el último día registrado
            const ultimoDia = registros.length ? registros[registros.length - 1].Dia_Programado : 0

            // Encuentra el siguiente día disponible
            const nextDay = diasSeguimiento.find(d => d > ultimoDia) || diasSeguimiento[diasSeguimiento.length - 1]
            setDiaProgramado(nextDay)

            // Calcula la fecha programada basada en el parto
            const parto = partos.find(p => p.Id_parto === Number(idPartoVal))
            if (parto && parto.Fec_fin) {
                const fechaProg = calcularFechaProgramada(parto.Fec_fin, nextDay)
                setFechaProgramada(fechaProg)
                setFechaReal(fechaProg)
            }
        } catch (error) {
            console.error("Error obteniendo registros previos de seguimiento de cerda:", error)
        }
    }

    useEffect(() => {
        getPartos()
        getResponsables()
        getMedicamentos()
    }, [])

    useEffect(() => {
        if (Id_parto && partos.length > 0 && (!Seguimiento_CerdaEdit || modoCorreccion)) {
            actualizarDiaYFecha(Id_parto)
        }
    }, [Id_parto, partos, modoCorreccion])

    useEffect(() => {
        if (Seguimiento_CerdaEdit) {
            setId_Seguimiento_Cerda(Seguimiento_CerdaEdit.Id_Seguimiento_Cerda ?? '')
            setIdParto(Seguimiento_CerdaEdit.Id_parto ?? '')
            setPartoConfirmado(true)
            setDiaProgramado(Seguimiento_CerdaEdit.Dia_Programado ?? '')
            setFechaReal(Seguimiento_CerdaEdit.Fecha_Real?.split('T')[0] ?? '')
            setId_Responsable(Seguimiento_CerdaEdit.Id_Responsable ?? '')
            setId_Medicamento(Seguimiento_CerdaEdit.Id_Medicamento ?? '')
            setObservaciones(Seguimiento_CerdaEdit.Observaciones ?? '')
            setTextFormButton("Actualizar")

            // Calcular fecha programada del parto
            const parto = partos.find(p => p.Id_parto === Number(Seguimiento_CerdaEdit.Id_parto))
            if (parto?.Fec_fin && Seguimiento_CerdaEdit.Dia_Programado) {
                const fechaProg = calcularFechaProgramada(parto.Fec_fin, Seguimiento_CerdaEdit.Dia_Programado)
                setFechaProgramada(fechaProg)
            }
        } else {
            resetForm()
            if (partoIdParams) {
                setIdParto(partoIdParams)
                setPartoConfirmado(true)
            }
        }
    }, [Seguimiento_CerdaEdit, partos, partoIdParams])

    const getPartos = async () => {
        try {
            const response = await apiAxios.get('/partos/')
            setPartos(response.data)
        } catch (error) {
            console.error('Error obteniendo partos:', error)
            setPartos([])
        }
    }

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables/')
            setResponsables(response.data)
        } catch (error) {
            console.error('Error obteniendo responsables:', error)
            setResponsables([])
        }
    }

    const getMedicamentos = async () => {
        try {
            const response = await apiAxios.get('/medicamentos/')
            setMedicamentos(response.data)
        } catch (error) {
            console.error('Error obteniendo medicamentos:', error)
            setMedicamentos([])
        }
    }

    const resetForm = () => {
        setId_Seguimiento_Cerda('')
        setIdParto('')
        setDiaProgramado('')
        setFechaProgramada('')
        setFechaReal('')
        setId_Responsable('')
        setId_Medicamento('')
        setObservaciones('')
        setPartoConfirmado(false)
        setModoCorreccion(false)
        setTextFormButton("Enviar")
    }

    const handleSelectParto = (idVal) => {
        if (!idVal) return
        setIdParto(idVal)
        setPartoConfirmado(true)
    }

    const activarCorreccion = async () => {
        const result = await MySwal.fire({
            icon: "warning",
            title: "Cambiar parto",
            text: "Se reiniciará el cálculo del seguimiento actual.",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "Cancelar"
        })

        if (result.isConfirmed) {
            setModoCorreccion(true)
            setPartoConfirmado(false)
            setIdParto('')
            setDiaProgramado('')
            setFechaProgramada('')
            setFechaReal('')
        }
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        const data = {
            Id_parto: Number(Id_parto),
            Dia_Programado: Number(Dia_Programado),
            Fecha_Real,
            Id_Responsable: Number(Id_Responsable),
            Id_Medicamento: Id_Medicamento ? Number(Id_Medicamento) : null,
            Observaciones
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/Seguimiento_Cerda/', data)
                MySwal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Seguimiento de cerda registrado correctamente'
                })
            } else {
                await apiAxios.put(`/Seguimiento_Cerda/${Id_Seguimiento_Cerda}`, data)
                MySwal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Seguimiento de cerda actualizado correctamente'
                })
            }

            hideModal()
            if (reload) reload()

        } catch (error) {
            console.error(error.response?.data || error.message)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el seguimiento de la cerda'
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="text-center mb-4">
                <h5 className="fw-bold">📋 Seguimiento de Cerda</h5>
                <small className="text-muted">Registro de control post-parto de la madre</small>
            </div>

            {/* Edición */}
            {Seguimiento_CerdaEdit && !modoCorreccion ? (
                <>
                    <div className="row mb-3">

                        <div className="col-6">
                            <label className="form-label fw-semibold">Día Seguimiento</label>
                            <input
                                type="text"
                                className="form-control"
                                style={{ backgroundColor: "#E3E3E3" }}
                                value={`Día N° ${Dia_Programado}`}
                                readOnly
                            />
                        </div>

                        <div className="col-6">
                            <label className="form-label fw-semibold">Fecha Programada</label>
                            <input
                                type="date"
                                className="form-control py-2"
                                style={{ backgroundColor: "#E3E3E3" }}
                                value={Fecha_Programada}
                                readOnly
                            />
                        </div>
                    </div>
                </>
            ) : (

                <div className="mb-3">
                    {/* CAMPOS AUTOMÁTICOS EN MODO CREACIÓN */}
                    {(!Seguimiento_CerdaEdit || modoCorreccion) && Id_parto && (
                        <div className="row mb-3">
                            <div className="col-6">
                                <label className="form-label fw-semibold">Día Seguimiento</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ backgroundColor: "#d1ecf1" }}
                                    value={`Día N° ${Dia_Programado}`}
                                    readOnly
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-semibold">Fecha Programada</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    style={{ backgroundColor: "#d1ecf1" }}
                                    value={Fecha_Programada}
                                    readOnly
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CAMPOS DINÁMICOS FORMULARIO (visibles cuando hay un parto seleccionado o en modo edición) */}
            {(Id_parto || Seguimiento_CerdaEdit) && (
                <div className="row g-3">
                    {/* FECHA REAL */}
                    <div className="col-md-12">
                        <label className="form-label fw-semibold">📅 Fecha Real</label>
                        <input
                            type="date"
                            className="form-control shadow-sm"
                            value={Fecha_Real}
                            onChange={(e) => setFechaReal(e.target.value)}
                            required
                        />
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
                            <option value="">Seleccione...</option>
                            {responsables.map((resp) => (
                                <option key={resp.Id_Responsable} value={resp.Id_Responsable}>
                                    {resp.Nombres} {resp.Apellidos || ''}
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
                        >
                            <option value="">Ninguno</option>
                            {medicamentos.map((med) => (
                                <option key={med.Id_Medicamento} value={med.Id_Medicamento}>
                                    {med.Nombre}
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
                            rows="3"
                            placeholder="Escriba observaciones del estado físico o comportamiento de la cerda..."
                        />
                    </div>
                </div>
            )}

            {/* BOTÓN DE ACCIÓN */}
            {(Id_parto || Seguimiento_CerdaEdit) && (
                <div className="d-grid mt-4">
                    <button className="btn btn-primary fw-semibold py-2 shadow-sm">
                        {textFormButton}
                    </button>
                </div>
            )}
        </form>
    )
}

export default Seguimiento_CerdaForm