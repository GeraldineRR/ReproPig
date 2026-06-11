import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const CalendarioForm = ({ hideModal, calendarioEdit, reload, preloaded, isInactive }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Calendario, setId_Calendario] = useState('')
    const [Id_Reproduccion, setId_Reproduccion] = useState('')
    const [Fecha_Servicio, setFecha_Servicio] = useState('')

    // reales (nuevos nombres)
    const [real_rc1, setRealRC1] = useState('')
    const [real_rc2, setRealRC2] = useState('')
    const [real_cambio, setRealCambio] = useState('')
    const [real_107, setReal107] = useState('')
    const [real_parto, setRealParto] = useState('')

    const [proyectados, setProyectados] = useState(['', '', '', '', ''])
    const [reproducciones, setReproducciones] = useState([])

    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getReproducciones()

        if (preloaded?.Id_Reproduccion) {
            setId_Reproduccion(preloaded.Id_Reproduccion)
        }
        if (preloaded?.Fecha_Servicio) {
            setFecha_Servicio(preloaded.Fecha_Servicio)
        }
    }, [preloaded])

    useEffect(() => {
        if (calendarioEdit) {
            setId_Calendario(calendarioEdit.Id_Calendario ?? '')
            setId_Reproduccion(calendarioEdit.Id_Reproduccion ?? '')
            setFecha_Servicio(calendarioEdit.Fecha_Servicio?.split('T')[0] ?? '')

            setRealRC1(calendarioEdit.real_rc1?.split('T')[0] ?? '')
            setRealRC2(calendarioEdit.real_rc2?.split('T')[0] ?? '')
            setRealCambio(calendarioEdit.real_cambio_alimento?.split('T')[0] ?? '')
            setReal107(calendarioEdit.real_dia_107?.split('T')[0] ?? '')
            setRealParto(calendarioEdit.real_parto?.split('T')[0] ?? '')

            setProyectados([
                calendarioEdit.rc1?.split('T')[0] ?? '',
                calendarioEdit.rc2?.split('T')[0] ?? '',
                calendarioEdit.cambio_alimento?.split('T')[0] ?? '',
                calendarioEdit.dia_107?.split('T')[0] ?? '',
                calendarioEdit.parto?.split('T')[0] ?? '',
            ])

            setTextFormButton('Actualizar')
        } else {
            setTextFormButton('Enviar')
        }
    }, [calendarioEdit])

    // cálculo correcto
    useEffect(() => {
        if (calendarioEdit || !Fecha_Servicio) return

        const base = new Date(Fecha_Servicio + 'T00:00:00')

        const sumar = (dias) => {
            const d = new Date(base)
            d.setDate(d.getDate() + dias)
            return d.toISOString().split('T')[0]
        }

        setProyectados([
            sumar(21),
            sumar(42),
            sumar(100),
            sumar(107),
            sumar(114),
        ])
    }, [Fecha_Servicio])

    const getMinDate = (fecha) => {
        if (!fecha) return undefined
        const d = new Date(fecha + 'T00:00:00')
        d.setDate(d.getDate() - 5)
        return d.toISOString().split('T')[0]
    }

    const EVENTOS = [
        '1RC',
        '2RC',
        'Cambio Alimento',
        'Traslado a lactancia',
        'Parto'
    ]

    const reales = [
        real_rc1,
        real_rc2,
        real_cambio,
        real_107,
        real_parto
    ]

    const setters = [
        setRealRC1,
        setRealRC2,
        setRealCambio,
        setReal107,
        setRealParto
    ]

    const getReproducciones = async () => {
        try {
            const response = await apiAxios.get('/reproducciones/')
            setReproducciones(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (!Fecha_Servicio) {
            MySwal.fire({
                icon: 'warning',
                title: 'Sin fecha de servicio',
                text: 'No se puede guardar el calendario sin una fecha de servicio. Registre primero una monta o inseminación.'
            })
            return
        }

        for (let i = 0; i < reales.length; i++) {
            if (reales[i] && proyectados[i]) {
                const min = getMinDate(proyectados[i])
                if (reales[i] < min) {
                    MySwal.fire({
                        icon: 'warning',
                        title: 'Fecha inválida',
                        text: `La fecha real de ${EVENTOS[i]} no puede ser menor al ${min.split('-').reverse().join('/')} (5 días antes de la programada).`
                    })
                    return
                }
            }
        }

        const data = {
            Id_Reproduccion,
            Fecha_Servicio,

            real_rc1: real_rc1 || null,
            real_rc2: real_rc2 || null,
            real_cambio_alimento: real_cambio || null,
            real_dia_107: real_107 || null,
            real_parto: real_parto || null,
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/calendario/', data)
            } else {
                await apiAxios.put(`/calendario/${Id_Calendario}`, data)
            }

            MySwal.fire({
                icon: 'success',
                title: 'Guardado',
                text: 'Calendario guardado correctamente'
            })

            hideModal()
            reload && reload()

        } catch (error) {
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar'
            })
        }
    }

    const currentRep = reproducciones.find(r => String(r.Id_Reproduccion) === String(Id_Reproduccion));

    let tipoServicio = '';
    if (currentRep && Fecha_Servicio) {
        const isMonta = currentRep.montas?.some(m => m.Fec_hora?.startsWith(Fecha_Servicio));
        const isInsem = currentRep.inseminaciones?.some(i => i.Fec_hora?.startsWith(Fecha_Servicio));

        if (isMonta && isInsem) tipoServicio = '— (Monta e Inseminación)';
        else if (isMonta) tipoServicio = '— (Monta)';
        else if (isInsem) tipoServicio = '— (Inseminación)';
    }

    return (
        <form onSubmit={gestionarForm}>

            {isInactive && (
                <div className="alert alert-warning py-2 mb-3 text-center fw-bold">
                    ⚠️ Esta reproducción está inactiva. El calendario es de solo lectura.
                </div>
            )}

            <div className="mb-3">
                <label>Reproducción</label>
                <select className="form-control"
                    value={Id_Reproduccion}
                    onChange={(e) => setId_Reproduccion(e.target.value)}
                    disabled={!!calendarioEdit || !!preloaded?.Id_Reproduccion}
                >
                    <option value="">Seleccione</option>
                    {reproducciones.map(rep => (
                        <option key={rep.Id_Reproduccion} value={rep.Id_Reproduccion}>
                            #{rep.Id_Reproduccion} — {rep.porcino?.Nom_Porcino || `Cerda ${rep.Id_Cerda}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label>Fecha Servicio {tipoServicio}</label>
                <input type="date"
                    className="form-control"
                    value={Fecha_Servicio}
                    onChange={(e) => setFecha_Servicio(e.target.value)} readOnly
                />
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Evento</th>
                        <th>Proyectado</th>
                        <th>Real</th>
                    </tr>
                </thead>

                <tbody>
                    {EVENTOS.map((evento, i) => (
                        <tr key={evento}>
                            <td>{evento}</td>

                            <td>{proyectados[i] ? proyectados[i].split('-').reverse().join('/') : '—'}</td>

                            <td>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={reales[i]}
                                    min={getMinDate(proyectados[i])}
                                    onChange={(e) => setters[i](e.target.value)}
                                    disabled={isInactive}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {!isInactive && (
                <button className="btn btn-primary">
                    {textFormButton}
                </button>
            )}

        </form>
    )
}

export default CalendarioForm