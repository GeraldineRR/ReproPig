import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { customTableStyles } from "../../styles/tableStyles.js"
import { TbTrash } from "react-icons/tb"

const SubActividades = ({ segCamada }) => {
    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [tipos, setTipos] = useState([])
    const [form, setForm] = useState({
        Tipo_Actividad: '',
        Fecha_Actividad: segCamada?.Fecha_Real?.split('T')[0] || new Date().toISOString().split('T')[0],
        Observaciones: '',
        Id_Medicamento: ''
    })

    const columns = [
        {
            name: 'Tipo Actividad',
            selector: row => row.Tipo_Actividad,
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    {row.Tipo_Actividad}
                </span>
            ),
            sortable: true
        },
        {
            name: 'Fecha',
            selector: row => row.Fecha_Actividad ? row.Fecha_Actividad.split('T')[0].split('-').reverse().join('/') : '—',
            sortable: true,
            width: '110px'
        },
        {
            name: 'Medicamento',
            selector: row => row.medicamentos?.Nombre || '—',
            cell: row => (
                row.medicamentos?.Nombre ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {row.medicamentos.Nombre}
                    </span>
                ) : <span className="text-gray-400 italic text-xs">—</span>
            ),
            sortable: true
        },
        {
            name: 'Observaciones',
            selector: row => row.Observaciones || '—',
            cell: row => <span className="text-gray-600 text-xs">{row.Observaciones || '—'}</span>
        },
        {
            name: 'Acciones',
            cell: row => (
                <button
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    onClick={() => handleDelete(row.Id_Actividad)}
                    title="Eliminar"
                >
                    <TbTrash className="w-4 h-4" />
                </button>
            ),
            width: '80px'
        }
    ]

    useEffect(() => {
        if (segCamada) {
            getActividades()
            getMedicamentos()
            getTipos()
        }
    }, [segCamada])

    const getTipos = async () => {
        try {
            const res = await apiAxios.get('/tipos_actividad/')
            const lista = Array.isArray(res.data)
                ? res.data.filter(t => t.Estado !== 'Inactivo').map(t => t.Nombre || t)
                : []
            setTipos(lista)
        } catch (error) {
            console.error("Error al obtener tipos de actividad:", error)
        }
    }

    const getActividades = async () => {
        try {
            const res = await apiAxios.get('/actividades_camada/')
            const filtradas = res.data.filter(a => Number(a.Id_SegCamada) === Number(segCamada.Id_SegCamada))
            setActividades(filtradas)
        } catch (error) {
            console.error("Error al obtener actividades:", error)
        }
    }

    const getMedicamentos = async () => {
        try {
            const res = await apiAxios.get('/medicamentos/')
            setMedicamentos(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error("Error al obtener medicamentos:", error)
        }
    }

    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await apiAxios.delete(`/actividades_camada/${id}`)
                MySwal.fire('Eliminada!', 'La actividad ha sido eliminada.', 'success')
                getActividades()
            } catch (error) {
                MySwal.fire('Error', 'No se pudo eliminar', 'error')
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.Tipo_Actividad) {
            MySwal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor selecciona el tipo de actividad.' })
            return
        }

        try {
            await apiAxios.post('/actividades_camada/', {
                ...form,
                Id_SegCamada: segCamada.Id_SegCamada,
                Id_Medicamento: form.Id_Medicamento || null
            })
            MySwal.fire({ icon: 'success', title: 'Guardado', text: 'Actividad registrada correctamente.', timer: 1500, showConfirmButton: false })
            setForm({
                Tipo_Actividad: '',
                Fecha_Actividad: segCamada?.Fecha_Real?.split('T')[0] || new Date().toISOString().split('T')[0],
                Observaciones: '',
                Id_Medicamento: ''
            })
            getActividades()
        } catch (error) {
            console.error("Error al guardar actividad:", error)
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'No se pudo guardar.' })
        }
    }

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className="mb-4 bg-light p-3 rounded">
                <h6 className="mb-3 font-bold text-gray-800">Registrar Nueva Actividad</h6>
                <div className="row">
                    <div className="col-md-3 mb-2">
                        <label className="form-label font-semibold text-xs text-gray-700">Tipo Actividad</label>
                        <select
                            className="form-control text-xs"
                            required
                            value={form.Tipo_Actividad}
                            onChange={e => setForm({...form, Tipo_Actividad: e.target.value})}
                        >
                            <option value="">Selecciona...</option>
                            {tipos.map((t, idx) => (
                                <option key={idx} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3 mb-2">
                        <label className="form-label font-semibold text-xs text-gray-700">Fecha</label>
                        <input
                            type="date"
                            className="form-control text-xs"
                            required
                            value={form.Fecha_Actividad}
                            onChange={e => setForm({...form, Fecha_Actividad: e.target.value})}
                        />
                    </div>
                    <div className="col-md-3 mb-2">
                        <label className="form-label font-semibold text-xs text-gray-700">Medicamento</label>
                        <select
                            className="form-control text-xs"
                            value={form.Id_Medicamento}
                            onChange={e => setForm({...form, Id_Medicamento: e.target.value})}
                        >
                            <option value="">Ninguno</option>
                            {medicamentos.map(m => (
                                <option key={m.Id_Medicamento} value={m.Id_Medicamento}>{m.Nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3 mb-2">
                        <label className="form-label font-semibold text-xs text-gray-700">Observaciones</label>
                        <input
                            type="text"
                            className="form-control text-xs"
                            placeholder="Detalles u observaciones..."
                            value={form.Observaciones}
                            onChange={e => setForm({...form, Observaciones: e.target.value})}
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-sm btn-success mt-2 font-medium">Agregar Actividad</button>
            </form>

            <div className="border border-gray-100 rounded-2xl overflow-hidden mt-3">
                <DataTable
                    columns={columns}
                    data={actividades}
                    noDataComponent="No hay actividades registradas en esta sesión"
                    customStyles={customTableStyles}
                    highlightOnHover
                />
            </div>
        </div>
    )
}

export default SubActividades
