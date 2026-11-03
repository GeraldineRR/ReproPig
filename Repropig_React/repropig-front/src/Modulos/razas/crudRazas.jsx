import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import RazaForm from "./razaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { customTableStyles } from "../../styles/tableStyles.js"
import Swal from 'sweetalert2'
import WithReactContent from 'sweetalert2-react-content'
import {
    TbDna,
    TbSearch,
    TbPlus,
    TbPencil,
    TbPower,
    TbBoxPadding
} from "react-icons/tb"

const CrudRazas = () => {

    const [razas, setRazas] = useState([])
    const [loadingId, setLoadingId] = useState(null);
    const [razaEdit, setRazaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')

    const MySwal = WithReactContent(Swal)

    // Función para alternar el estado de la raza con confirmación SweetAlert
    const toggleEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
        const accion = esActivo ? 'inactivar' : 'activar';

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} esta raza?`,
            text: `La raza ${row.Nom_Raza} pasará a estar ${esActivo ? 'Inactiva' : 'Activa'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoadingId(row.Id_Raza);
            try {
                const res = await apiAxios.put(`/raza/${row.Id_Raza}/toggle-estado`);
                MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                setRazas(prev =>
                    prev.map(p =>
                        p.Id_Raza === row.Id_Raza
                            ? { ...p, Estado: res.data.Estado }
                            : p
                    )
                );
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado de la raza.' });
            } finally {
                setLoadingId(null);
            }
        }
    };

    const columnsTable = [
        {
            name: 'ID',
            selector: row => row.Id_Raza,
            sortable: true,
            width: '80px',
            center: true,
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    #{row.Id_Raza}
                </span>
            )
        },
        {
            name: 'Nombre de la Raza',
            selector: row => row.Nom_Raza,
            sortable: true,
            grow: 1,
            cell: row => (
                <div className="flex items-center gap-2.5 py-1">
                    <span className="font-semibold text-gray-900 text-xs">
                        {row.Nom_Raza}
                    </span>
                </div>
            )
        },
        {
            name: 'Estado',
            width: '140px',
            center: true,
            cell: row => {
                const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
                return (
                    <button
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${esActivo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                            }`}
                        onClick={() => toggleEstado(row)}
                        disabled={loadingId === row.Id_Raza}
                        title="Clic para cambiar estado"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${esActivo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {loadingId === row.Id_Raza ? '...' : (esActivo ? 'Activo' : 'Inactivo')}
                    </button>
                );
            }
        },
        {
            name: 'Acciones',
            width: '110px',
            center: true,
            cell: row => (
                <div className="flex items-center justify-center w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-xs"
                        onClick={() => handleEdit(row)}
                        title="Editar Raza"
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        getAllRazas()
    }, [])

    const getAllRazas = async () => {
        const response = await apiAxios.get('/raza/')
        setRazas(response.data)
    }

    const newListRazas = razas.filter(raza => {
        return raza.Nom_Raza.toLowerCase()
            .includes(filterText.toLowerCase())
    })

    const hideModal = () => {
        setRazaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (raza) => {
        setRazaEdit(raza)

        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )
        modal.show()
    }

    return (
        <>
            <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                            <TbDna className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Catálogo de Razas</h1>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    {newListRazas.length} razas
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Gestión de razas y líneas genéticas de la explotación porcina</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transition-all duration-200"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        onClick={() => setRazaEdit(null)}
                    >
                        <TbPlus className="w-5 h-5" />
                        <span>Nueva Raza</span>
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Listado de Razas</h2>
                            <p className="text-xs text-gray-400">Control de líneas genéticas activas</p>
                        </div>
                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar raza..."
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={newListRazas}
                        keyField="Id_Raza"
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No se encontraron razas registradas
                            </div>
                        }
                    />
                </div>

                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h1 className="modal-title fs-5">
                                    {razaEdit
                                        ? "Editar Raza"
                                        : "Agregar Raza"}
                                </h1>

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <RazaForm
                                    key={razaEdit
                                        ? razaEdit.Id_Raza
                                        : 'new'
                                    }
                                    hideModal={hideModal}
                                    razaEdit={razaEdit}
                                    reload={getAllRazas}
                                />
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudRazas