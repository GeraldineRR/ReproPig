import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const SubActividades = ({ segCamada }) => {
    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [form, setForm] = useState({ Tipo_Actividad: '', Fecha_Actividad: segCamada?.Fecha_Real?.split('T')[0] || new Date().toISOString().split('T')[0], Observaciones: '', Id_Medicamento: '' })

    const columns = [
        {
            name: 'Tipo Actividad',
            selector: row => row.Tipo_Actividad
        },
        {
            name: 'Fecha',
            selector: row => row.Fecha_Actividad
        },
        {
            name: 'Medicamento',
            selector: row => row.medicamentos?.Nombre || 'N/A'
        },
        {
            name: 'Observaciones',
            selector: row => row.Observaciones || 'N/A'
        },
        {
            name: 'Acciones',
            cell: row => (
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(row.Id_Actividad)}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        if (segCamada) {
            getActividades()
            getMedicamentos()
        }
    }, [segCamada])

    const getActividades = async () => {
        try {
            const res = await apiAxios.get('/actividades_camada/')
            const filtradas = res.data.filter(a => Number(a.Id_SegCamada) === Number(segCamada.Id_SegCamada))
            setActividades(filtradas)
        } catch (error) {
            console.error(error)
        }
    }

    const getMedicamentos = async () => {
        try {
            const res = await apiAxios.get('/medicamentos/')
            setMedicamentos(res.data)
        } catch (error) {
            console.error(error)
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
        try {
            await apiAxios.post('/actividades_camada/', {
                ...form,
                Id_SegCamada: segCamada.Id_SegCamada,
                Id_Medicamento: form.Id_Medicamento || null
            })
            MySwal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false })
            setForm({ Tipo_Actividad: '', Fecha_Actividad: segCamada?.Fecha_Real?.split('T')[0] || new Date().toISOString().split('T')[0], Observaciones: '', Id_Medicamento: '' })
            getActividades()
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar.' })
        }
    }

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className="mb-4 bg-light p-3 rounded">
                <h6 className="mb-3">Registrar Nueva Actividad</h6>
                <div className="row">
                    <div className="col-md-3 mb-2">
                        <label className="form-label">Tipo Actividad</label>
                        <select className="form-control" required value={form.Tipo_Actividad} onChange={e => setForm({...form, Tipo_Actividad: e.target.value})}>
                            <option value="">Selecciona...</option>
                            <option value="Vacunación">Vacunación</option>
                            <option value="Desparasitación">Desparasitación</option>
                            <option value="Pesaje">Pesaje</option>
                            <option value="Corte de cola">Corte de cola</option>
                            <option value="Corte de colmillos">Corte de colmillos</option>
                            <option value="Castración">Castración</option>
                            <option value="Aplicación hierro">Aplicación hierro</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div className="col-md-3 mb-2">
                        <label className="form-label">Fecha</label>
                        <input type="date" className="form-control" required value={form.Fecha_Actividad} onChange={e => setForm({...form, Fecha_Actividad: e.target.value})} />
                    </div>
                    <div className="col-md-3 mb-2">
                        <label className="form-label">Medicamento</label>
                        <select className="form-control" value={form.Id_Medicamento} onChange={e => setForm({...form, Id_Medicamento: e.target.value})}>
                            <option value="">Ninguno</option>
                            {medicamentos.map(m => (
                                <option key={m.Id_Medicamento} value={m.Id_Medicamento}>{m.Nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3 mb-2">
                        <label className="form-label">Observaciones</label>
                        <input type="text" className="form-control" value={form.Observaciones} onChange={e => setForm({...form, Observaciones: e.target.value})} />
                    </div>
                </div>
                <button type="submit" className="btn btn-success mt-2">Agregar Actividad</button>
            </form>

            <DataTable
                columns={columns}
                data={actividades}
                noDataComponent="No hay actividades registradas en esta sesión"
                striped
            />
        </div>
    )
}

export default SubActividades
