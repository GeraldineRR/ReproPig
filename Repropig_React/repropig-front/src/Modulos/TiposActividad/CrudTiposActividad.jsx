import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import TipoActividadForm from "./TipoActividadForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { customTableStyles } from "../../styles/tableStyles.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {
    TbListCheck,
    TbSearch,
    TbPlus,
    TbPencil,
    TbTrash
} from "react-icons/tb"

const CrudTiposActividad = () => {
    const MySwal = withReactContent(Swal)

    const [tipos, setTipos] = useState([])
    const [tipoEdit, setTipoEdit] = useState(null)
    const [filterText, setFilterText] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getTipos()
    }, [])

    const getTipos = async () => {
        setLoading(true)
        try {
            const res = await apiAxios.get('/tipos_actividad/')
            setTipos(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error("Error al obtener tipos de actividad:", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || !row.Estado
        const accion = esActivo ? 'inactivar' : 'activar'

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} esta actividad?`,
            text: `La actividad "${row.Nombre}" pasará a estar ${esActivo ? 'Inactiva' : 'Activa'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#10b981',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/tipos_actividad/${row.Id_Tipo}/toggle-estado`)
                MySwal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    timer: 1500,
                    showConfirmButton: false
                })
                getTipos()
            } catch (error) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cambiar el estado de la actividad.'
                })
            }
        }
    }

    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: '¿Eliminar tipo de actividad?',
            text: `Se eliminará "${row.Nombre}". Esta acción no se puede revertir.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await apiAxios.delete(`/tipos_actividad/${row.Id_Tipo}`)
                MySwal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La actividad ha sido eliminada correctamente.',
                    timer: 1500,
                    showConfirmButton: false
                })
                getTipos()
            } catch (error) {
                console.error("Error al eliminar tipo:", error)
                MySwal.fire({
                    icon: 'error',
                    title: 'No se pudo eliminar',
                    text: error.response?.data?.message || 'La actividad está asociada a registros existentes.'
                })
            }
        }
    }

    const handleEdit = (row) => {
        setTipoEdit(row)
        const modalElement = document.getElementById('modalTipoActividad')
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement)
            modal.show()
        }
    }

    const handleNew = () => {
        setTipoEdit(null)
        const modalElement = document.getElementById('modalTipoActividad')
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement)
            modal.show()
        }
    }

    const hideModal = () => {
        setTipoEdit(null)
        const closeBtn = document.getElementById('closeModalTipoActividad')
        if (closeBtn) closeBtn.click()
        getTipos()
    }

    const filteredTipos = tipos.filter(item => {
        const query = filterText.toLowerCase().trim()
        if (!query) return true
        const nombre = (item.Nombre || '').toLowerCase()
        const desc = (item.Descripcion || '').toLowerCase()
        const id = String(item.Id_Tipo || '')
        const estado = (item.Estado || '').toLowerCase()
        return nombre.includes(query) || desc.includes(query) || id.includes(query) || estado.includes(query)
    })

    const columns = [
        {
            name: 'ID',
            selector: row => row.Id_Tipo,
            sortable: true,
            width: '80px',
            center: true,
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    #{row.Id_Tipo}
                </span>
            )
        },
        {
            name: 'Tipo de Actividad',
            selector: row => row.Nombre,
            sortable: true,
            minWidth: '220px',
            cell: row => (
                <div className="flex items-center gap-2.5 py-1">
                    <div>
                        <div className="font-bold text-gray-900 text-xs">
                            {row.Nombre}
                        </div>
                    </div>
                </div>
            )
        },
        {
            name: 'Descripción / Especificaciones',
            selector: row => row.Descripcion || '—',
            minWidth: '260px',
            grow: 1,
            cell: row => (
                <span className="text-xs text-gray-600 line-clamp-2" title={row.Descripcion || ''}>
                    {row.Descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                </span>
            )
        },
        {
            name: 'Estado',
            width: '130px',
            center: true,
            cell: row => {
                const esActivo = row.Estado === 'Activo' || !row.Estado
                return (
                    <button
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${esActivo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                            }`}
                        onClick={() => toggleEstado(row)}
                        title="Clic para cambiar estado"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${esActivo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {esActivo ? 'Activo' : 'Inactivo'}
                    </button>
                )
            }
        },
        {
            name: 'Acciones',
            width: '120px',
            center: true,
            cell: row => (
                <div className="flex items-center justify-center gap-1.5 py-1">
                    <button
                        className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors shadow-xs"
                        onClick={() => handleEdit(row)}
                        title="Editar tipo de actividad"
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shadow-xs"
                        onClick={() => handleDelete(row)}
                        title="Eliminar tipo de actividad"
                    >
                        <TbTrash className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <TbListCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tipos de Actividad</h1>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {tipos.length} tipos registrados
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Catálogo manual de actividades para registrar en tratamientos y manejo de lechones y cerdas
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-md shadow-indigo-500/20 px-5 py-2.5 text-sm hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
                        onClick={handleNew}
                    >
                        <TbPlus className="w-5 h-5" />
                        <span>Nueva Actividad</span>
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Catálogo de Actividades</h2>
                        <p className="text-xs text-gray-400">Listado de actividades disponibles para asignación manual</p>
                    </div>
                    <div className="relative w-full sm:w-80 md:w-96">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Buscar tipo de actividad o descripción..."
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                        {filterText && (
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs"
                                onClick={() => setFilterText('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filteredTipos}
                        pagination
                        highlightOnHover
                        progressPending={loading}
                        progressComponent={<div className="p-8 text-center text-gray-400 text-sm">Cargando actividades...</div>}
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 text-sm">
                                {filterText ? 'No se encontraron actividades con ese criterio' : 'No hay tipos de actividad registrados aún'}
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Modal Tipo de Actividad */}
            <div className="modal fade" id="modalTipoActividad" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-3xl border-0 shadow-2xl p-2">
                        <div className="modal-header border-0 pb-0">
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                id="closeModalTipoActividad"
                                onClick={() => setTipoEdit(null)}
                            ></button>
                        </div>
                        <div className="modal-body pt-0 px-4 pb-4">
                            <TipoActividadForm
                                tipoEdit={tipoEdit}
                                hideModal={hideModal}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrudTiposActividad
