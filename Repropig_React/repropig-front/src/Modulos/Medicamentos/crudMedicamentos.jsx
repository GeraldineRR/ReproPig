import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import MedicamentosForm from "./MedicamentosForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { customTableStyles } from "../../styles/tableStyles.js"
import Swal from 'sweetalert2'
import WithReactContent from 'sweetalert2-react-content'
import {
    TbPill,
    TbSearch,
    TbPlus,
    TbPencil
} from "react-icons/tb"

const CrudMedicamentos = () => {
    const [Medicamentos, setMedicamentos] = useState([])
    const [medicamentoEdit, setmedicamentoEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    const MySwal = WithReactContent(Swal)

    const toggleEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
        const accion = esActivo ? 'inactivar' : 'activar';

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} este medicamento?`,
            text: `El medicamento ${row.Nombre} pasará a estar ${esActivo ? 'Inactivo' : 'Activo'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/medicamentos/${row.Id_Medicamento}/toggle-estado`);
                MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                getAllMedicamentos();
            } catch (error) {
                try {
                    const nuevoEstado = esActivo ? 'Inactivo' : 'Activo';
                    await apiAxios.put(`/medicamentos/${row.Id_Medicamento}`, { ...row, Estado: nuevoEstado });
                    MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                    getAllMedicamentos();
                } catch (err) {
                    MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.' });
                }
            }
        }
    };

    const columnsTable = [
        {
            name: 'ID',
            selector: row => row.Id_Medicamento,
            sortable: true,
            width: '80px',
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    #{row.Id_Medicamento}
                </span>
            )
        },
        {
            name: 'Nombre',
            selector: row => row.Nombre,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-2.5 py-1">
                    <span className="font-semibold text-gray-900 text-xs">
                        {row.Nombre}
                    </span>
                </div>
            )
        },
        {
            name: 'Tipo',
            selector: row => row.Tipo,
            sortable: true,
            width: '120px',
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                    {row.Tipo || '—'}
                </span>
            )
        },
        {
            name: 'Presentación',
            selector: row => row.Presentacion,
            width: '130px',
            cell: row => <span className="text-xs text-gray-600">{row.Presentacion || '—'}</span>
        },
        {
            name: 'Cantidad',
            selector: row => row.Cantidad,
            sortable: true,
            width: '120px',
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {row.Cantidad ? `${row.Cantidad} ${row.Unidad_Medida || ''}` : '—'}
                </span>
            )
        },
        {
            name: 'Precio Unitario',
            selector: row => row.Precio_Unitario,
            sortable: true,
            width: '130px',
            cell: row => (
                <span className="text-xs font-semibold text-emerald-700">
                    {row.Precio_Unitario ? `$${Number(row.Precio_Unitario).toLocaleString('es-CO')}` : '—'}
                </span>
            )
        },
        {
            name: 'Observaciones',
            selector: row => row.Observaciones,
            minWidth: '150px',
            cell: row => <span className="text-xs text-gray-500">{row.Observaciones || '—'}</span>
        },
        {
            name: 'Estado',
            width: '110px',
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
                        title="Clic para cambiar estado"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${esActivo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {esActivo ? 'Activo' : 'Inactivo'}
                    </button>
                );
            }
        },
        {
            name: 'Acciones',
            width: '90px',
            cell: row => (
                <div className="flex gap-1.5 items-center justify-end w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-xs"
                        onClick={() => handleEdit(row)}
                        title="Editar"
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        getAllMedicamentos()
    }, [])

    const getAllMedicamentos = async () => {
        const response = await apiAxios.get('/medicamentos')
        setMedicamentos(response.data)
    }

    const newListMedicamentos = Medicamentos.filter(Medicamentos => {
        const textToSearch = filterText.toLowerCase()
        const Id = Medicamentos.Id_Medicamento.toString().toLowerCase()
        const Nombre = Medicamentos.Nombre.toLowerCase()
        const Tipo = Medicamentos.Tipo?.toLowerCase() || ''

        return (
            Id.includes(textToSearch) ||
            Nombre.includes(textToSearch) ||
            Tipo.includes(textToSearch)
        )
    }).sort((a, b) => b.Id_Medicamento - a.Id_Medicamento)

    const hideModal = () => {
        setmedicamentoEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (Medicamentos) => {
        setmedicamentoEdit(Medicamentos)
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    return (
        <>
            <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                            <TbPill className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Medicamentos & Sanidad</h1>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                                    {newListMedicamentos.length} productos
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Control de inventario veterinario, dosis, precios y tratamientos</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-sm shadow-md hover:from-teal-700 hover:to-emerald-700 hover:shadow-lg transition-all duration-200"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        onClick={() => setmedicamentoEdit(null)}
                    >
                        <TbPlus className="w-5 h-5" />
                        <span>Nuevo Medicamento</span>
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Inventario de Medicamentos</h2>
                            <p className="text-xs text-gray-400">Stock disponible, precios y estado</p>
                        </div>
                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all placeholder:text-gray-400"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar medicamento o tipo..."
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={newListMedicamentos}
                        keyField="Id_Medicamento"
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No se encontraron medicamentos registrados
                            </div>
                        }
                    />
                </div>



                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">{medicamentoEdit ? "Editar Medicamento" : "Agregar Medicamento"}</h1>
                                <button id="closeModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <MedicamentosForm key={medicamentoEdit ? medicamentoEdit.Id_Medicamento : 'new'} hideModal={hideModal} medicamentoEdit={medicamentoEdit} reload={getAllMedicamentos} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CrudMedicamentos