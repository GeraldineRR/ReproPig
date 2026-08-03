import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const CrudActividades = () => {
    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [filterText, setFilterText] = useState('')

    useEffect(() => {
        getActividades()
    }, [])

    const getActividades = async () => {
        try {
            const res = await apiAxios.get('/actividades_camada/')
            setActividades(res.data)
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

    const filteredActividades = actividades.filter(act => {
        const text = filterText.toLowerCase()
        const tipo = act.Tipo_Actividad?.toLowerCase() || ''
        const obs = act.Observaciones?.toLowerCase() || ''
        const lechon = act.segcamada?.porcino?.Nom_Porcino?.toLowerCase() || ''
        const idLechon = act.segcamada?.Id_Porcino?.toString() || ''
        const fecha = act.Fecha_Actividad?.toLowerCase() || ''
        
        return tipo.includes(text) || obs.includes(text) || lechon.includes(text) || idLechon.includes(text) || fecha.includes(text)
    })

    const columns = [
        {
            name: 'Lechón',
            selector: row => row.segcamada?.porcino?.Nom_Porcino || (row.segcamada?.Id_Porcino ? `#${row.segcamada.Id_Porcino}` : 'N/A'),
            sortable: true
        },
        {
            name: 'Tipo Actividad',
            selector: row => row.Tipo_Actividad,
            sortable: true
        },
        {
            name: 'Fecha',
            selector: row => {
                if (!row.Fecha_Actividad) return 'N/A';
                return row.Fecha_Actividad.split('T')[0].split('-').reverse().join('/');
            },
            sortable: true
        },
        {
            name: 'Medicamento',
            selector: row => row.medicamentos?.Nombre || 'N/A',
            sortable: true
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
                    title="Eliminar Actividad"
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            ),
            width: '100px'
        }
    ]

    return (
        <div className="container mt-5">
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">🔍</span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por lechón, tipo, observaciones, fecha..."
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <DataTable
                title="Todas las Actividades"
                columns={columns}
                data={filteredActividades}
                pagination
                highlightOnHover
                striped
                noDataComponent="No hay actividades registradas"
            />
        </div>
    )
}

export default CrudActividades
