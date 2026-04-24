import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const CalendarioForm = ({ hideModal, calendarioEdit, reload }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Calendario, setId_Calendario] = useState('')
    const [Id_Reproduccion, setId_Reproduccion] = useState('')
    const [Fecha_Servicio, setFecha_Servicio] = useState('')
    const [real1rcl, setReal1rcl] = useState('')
    const [real2rcl, setReal2rcl] = useState('')
    const [real3rcl, setReal3rcl] = useState('')
    const [real4rcl, setReal4rcl] = useState('')
    const [real5rcl, setReal5rcl] = useState('')

    const [proyectados, setProyectados] = useState(['', '', '', '', ''])
    const [reproducciones, setReproducciones] = useState([])

    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getReproducciones()
    }, [])

    useEffect(() => {
        if (calendarioEdit) {
            setId_Calendario(calendarioEdit.Id_Calendario ?? '')
            setId_Reproduccion(calendarioEdit.Id_Reproduccion ?? '')
            setFecha_Servicio(calendarioEdit.Fecha_Servicio?.split('T')[0] ?? '')
            setReal1rcl(calendarioEdit['real-1rcl']?.split('T')[0] ?? '')
            setReal2rcl(calendarioEdit['real-2rcl']?.split('T')[0] ?? '')
            setReal3rcl(calendarioEdit['real-3rcl']?.split('T')[0] ?? '')
            setReal4rcl(calendarioEdit['real-4rcl']?.split('T')[0] ?? '')
            setReal5rcl(calendarioEdit['real-5rcl']?.split('T')[0] ?? '')
            setProyectados([
                calendarioEdit['proyectado-1rcl']?.split('T')[0] ?? '',
                calendarioEdit['proyectado-2rcl']?.split('T')[0] ?? '',
                calendarioEdit['proyectado-3rcl']?.split('T')[0] ?? '',
                calendarioEdit['proyectado-4rcl']?.split('T')[0] ?? '',
                calendarioEdit['proyectado-5rcl']?.split('T')[0] ?? '',
            ])
            setTextFormButton('Actualizar')
        } else {
            setId_Calendario('')
            setId_Reproduccion('')
            setFecha_Servicio('')
            setReal1rcl('')
            setReal2rcl('')
            setReal3rcl('')
            setReal4rcl('')
            setReal5rcl('')
            setProyectados(['', '', '', '', ''])
            setTextFormButton('Enviar')
        }
    }, [calendarioEdit])

    // Calcular proyectados en tiempo real al cambiar Fecha_Servicio (solo en nuevo)
    useEffect(() => {
        if (calendarioEdit || !Fecha_Servicio) return
        const base = new Date(Fecha_Servicio + 'T00:00:00')
        const intervalos = [21, 42, 63, 84, 105]
        setProyectados(intervalos.map(dias => {
            const d = new Date(base)
            d.setDate(d.getDate() + dias)
            return d.toISOString().split('T')[0]
        }))
    }, [Fecha_Servicio])

    const getReproducciones = async () => {
        try {
            const response = await apiAxios.get('/reproducciones/')
            setReproducciones(response.data)
        } catch (error) {
            console.error('Error obteniendo reproducciones:', error)
            setReproducciones([])
        }
    }

    const gestionarForm = async (e) => {
        e.preventDefault()
        
        const data = {
            Id_Reproduccion,
            Fecha_Servicio,
            'real-1rcl': real1rcl || null,
            'real-2rcl': real2rcl || null,
            'real-3rcl': real3rcl || null,
            'real-4rcl': real4rcl || null,
            'real-5rcl': real5rcl || null,
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/Calendario/', data)
            } else {
                await apiAxios.put(`/Calendario/${Id_Calendario}`, data)
            }

            MySwal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Calendario guardado correctamente'
            })

            hideModal()
            if (reload) reload()

        } catch (error) {
            console.error(error.response?.data || error.message)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el Calendario'
            })
        }
    }

    const CICLOS = ['1rcl', '2rcl', '3rcl', '4rcl', '5rcl']
    const realesSetters = [setReal1rcl, setReal2rcl, setReal3rcl, setReal4rcl, setReal5rcl]
    const realesValues  = [real1rcl, real2rcl, real3rcl, real4rcl, real5rcl]

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="mb-3">
                <label htmlFor="Id_Reproduccion" className="form-label">Reproducción</label>
                <select
                    id="Id_Reproduccion"
                    className="form-control"
                    value={Id_Reproduccion}
                    onChange={(e) => setId_Reproduccion(e.target.value)}
                    required
                    disabled={!!calendarioEdit}
                >
                    <option value="">Selecciona...</option>
                    {reproducciones.map((rep) => (
                        <option key={rep.Id_Reproduccion} value={rep.Id_Reproduccion}>
                            #{rep.Id_Reproduccion} — {rep.Fecha ?? ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="Fecha_Servicio" className="form-label">Fecha de Servicio</label>
                <input
                    type="date"
                    id="Fecha_Servicio"
                    className="form-control"
                    value={Fecha_Servicio}
                    onChange={(e) => setFecha_Servicio(e.target.value)}
                    required
                    disabled={!!calendarioEdit}
                />
            </div>

            <table className="table table-sm table-bordered mt-3">
                <thead className="table-light">
                    <tr>
                        <th>Ciclo</th>
                        <th>Proyectado (auto)</th>
                        <th>Real</th>
                    </tr>
                </thead>
                <tbody>
                    {CICLOS.map((ciclo, i) => (
                        <tr key={ciclo}>
                            <td className="fw-semibold">{ciclo}</td>
                            <td className="text-success">{proyectados[i] || '—'}</td>
                            <td>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={realesValues[i]}
                                    onChange={(e) => realesSetters[i](e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mb-3 mt-3">
                <input
                    type="submit"
                    className="btn btn-primary"
                    value={textFormButton}
                />
            </div>

        </form>
    )
}

export default CalendarioForm