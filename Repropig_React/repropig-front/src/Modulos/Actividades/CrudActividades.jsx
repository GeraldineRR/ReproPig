import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const CrudActividades = () => {
    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [filterText, setFilterText] = useState('')

    useEffect(() => {
        getActividades()
        getMedicamentos()
        getResponsables()
    }, [])

    const getActividades = async () => {
        try {
            const res = await apiAxios.get('/actividades_camada/')
            setActividades(res.data)
        } catch (error) {
            console.error("Error al obtener actividades:", error)
        }
    }

    const getMedicamentos = async () => {
        try {
            const res = await apiAxios.get('/medicamentos/')
            setMedicamentos(res.data)
        } catch (error) {
            console.error("Error al obtener medicamentos:", error)
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(res.data)
        } catch (error) {
            console.error("Error al obtener responsables:", error)
        }
    }

    const parsearIDs = (valor) => {
        if (!valor) return []
        if (Array.isArray(valor)) return valor.map(Number)
        if (typeof valor === 'string' && valor.startsWith('[')) {
            try { return JSON.parse(valor).map(Number) } catch { return [] }
        }
        const num = Number(valor)
        return isNaN(num) ? [] : [num]
    }

    const getNombresMedicamentos = (val) => {
        const ids = parsearIDs(val)
        if (ids.length === 0) return 'N/A'
        const nombres = ids.map(id => {
            const m = medicamentos.find(med => Number(med.Id_Medicamento) === Number(id))
            return m ? m.Nombre : `#${id}`
        })
        return nombres.join(', ')
    }

    const getNombresResponsables = (val) => {
        const ids = parsearIDs(val)
        if (ids.length === 0) return 'N/A'
        const nombres = ids.map(id => {
            const r = responsables.find(resp => Number(resp.Id_Responsable) === Number(id))
            return r ? `${r.Nombres} ${r.Apellidos || ''}`.trim() : `#${id}`
        })
        return nombres.join(', ')
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
        const meds = getNombresMedicamentos(act.Id_Medicamento).toLowerCase()
        const resps = getNombresResponsables(act.Id_Responsable).toLowerCase()
        
        return tipo.includes(text) || obs.includes(text) || lechon.includes(text) || idLechon.includes(text) || fecha.includes(text) || meds.includes(text) || resps.includes(text)
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
            name: 'Medicamento(s)',
            selector: row => getNombresMedicamentos(row.Id_Medicamento),
            sortable: true,
            wrap: true
        },
        {
            name: 'Responsable(s)',
            selector: row => getNombresResponsables(row.Id_Responsable),
            sortable: true,
            wrap: true
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
                            placeholder="Buscar por lechón, tipo, medicamentos, responsables, observaciones..."
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
