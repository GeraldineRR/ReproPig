import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import DataTable from 'react-data-table-component'
import ResponsablesForm from "./responsablesForm.jsx";
import RegisterUsuario from "./RegisterUsuario.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { customTableStyles } from "../../styles/tableStyles.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    TbUsers,
    TbSearch,
    TbUserPlus,
    TbPencil
} from "react-icons/tb";

const MySwal = withReactContent(Swal);

const CrudResponsables = () => {

    const { usuario } = useAuth()
    const [responsables, setResponsables] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [rowToEdit, setRowToEdit] = useState(null);
    const [textformbutton, setTextformbutton] = useState('Enviar');

    useEffect(() => {
        getALLResponsables();
    }, []);

    const getALLResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables');
            setResponsables(response.data);
        } catch (error) {
            console.error("Error al cargar responsables:", error);
        }
    };

    const cambiarEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || !row.Estado;
        const accion = esActivo ? 'inactivar' : 'activar';
        const nombreCompleto = `${row.Nombres} ${row.Apellidos || ''}`.trim();

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} a este responsable?`,
            text: `El responsable ${nombreCompleto} pasará a estar ${esActivo ? 'Inactivo' : 'Activo'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/responsables/${row.Id_Responsable}`, {
                    Estado: esActivo ? 'Inactivo' : 'Activo'
                });
                MySwal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    text: `El responsable ${nombreCompleto} ahora está ${esActivo ? 'Inactivo' : 'Activo'}.`,
                    timer: 1500,
                    showConfirmButton: false
                });
                getALLResponsables();
            } catch (error) {
                console.error("Error al cambiar estado:", error);
                MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cambiar el estado del responsable.'
                });
            }
        }
    };

    const columnsTable = [
        {
            name: 'ID',
            selector: row => row.Id_Responsable,
            sortable: true,
            width: '80px',
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    #{row.Id_Responsable}
                </span>
            )
        },
        {
            name: 'Responsable',
            selector: row => `${row.Nombres} ${row.Apellidos}`,
            sortable: true,
            minWidth: '180px',
            cell: row => (
                <div className="flex items-center gap-2.5 py-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {row.Nombres ? row.Nombres.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 text-xs">
                            {row.Nombres} {row.Apellidos || ''}
                        </div>
                        <div className="text-[11px] text-gray-400">
                            Doc: {row.Documento || '---'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            name: 'Cargo',
            selector: row => row.Cargo,
            sortable: true,
            width: '130px',
            cell: row => {
                const c = (row.Cargo || '').toLowerCase();
                const isInstructor = c.includes('instructor');
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isInstructor
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                        {row.Cargo || '—'}
                    </span>
                );
            }
        },
        {
            name: 'Teléfono',
            selector: row => row.Telefono,
            width: '130px',
            cell: row => <span className="text-xs text-gray-600">{row.Telefono || '—'}</span>
        },
        {
            name: 'Email',
            selector: row => row.Email,
            minWidth: '160px',
            cell: row => <span className="text-xs text-gray-600">{row.Email || '—'}</span>
        },
        {
            name: 'Estado',
            width: '110px',
            center: true,
            cell: row => {
                const isActivo = row.Estado === 'Activo';
                return (
                    <button
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            isActivo
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                        }`}
                        onClick={() => cambiarEstado(row)}
                        title="Clic para alternar estado"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {row.Estado || 'Inactivo'}
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
                        onClick={() => setRowToEdit(row)}
                        data-bs-toggle='modal'
                        data-bs-target="#exampleModal"
                        title="Editar Responsable"
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const newlistResponsables = responsables.filter(responsable => {
        const textToSearch = filterText.toLowerCase();
        const nombre = responsable.Nombres?.toLowerCase() || '';
        const apellido = responsable.Apellidos?.toLowerCase() || '';
        const cargo = responsable.Cargo?.toLowerCase() || '';
        return nombre.includes(textToSearch) || apellido.includes(textToSearch) || cargo.includes(textToSearch)
    }).sort((a, b) => b.Id_Responsable - a.Id_Responsable);

    const hidemodal = () => {
        document.getElementById('closeModal').click();
        getALLResponsables();
    };

    const hideModalRegister = () => {
        document.getElementById('closeModalRegister').click();
    }

    return (
        <>
            <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                            <TbUsers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Directorio de Responsables</h1>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                    {newlistResponsables.length} usuarios
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Gestión de personal técnico, operarios, aprendices e instructores</p>
                        </div>
                    </div>

                    {(usuario?.cargo?.toLowerCase() === 'instructor' || usuario?.cargo?.toLowerCase() === 'gestor') && (
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all duration-200"
                            data-bs-toggle="modal"
                            data-bs-target="#modalRegister"
                        >
                            <TbUserPlus className="w-5 h-5" />
                            <span>Crear Usuario</span>
                        </button>
                    )}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Listado de Responsables</h2>
                            <p className="text-xs text-gray-400">Información de contacto, rol y estado de cuenta</p>
                        </div>
                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
                                placeholder="Buscar por nombre o cargo..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={newlistResponsables}
                        keyField="Id_Responsable"
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No se encontraron responsables registrados
                            </div>
                        }
                    />
                </div>

                {/* Modal Responsable */}
                <div className="modal fade" id="exampleModal" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Responsable</h1>
                                <button type="button" className="btn-close"
                                    data-bs-dismiss="modal" id="closeModal"></button>
                            </div>
                            <div className="modal-body">
                                <ResponsablesForm
                                    hidemodal={hidemodal}
                                    rowToEdit={rowToEdit}
                                    textformbutton={textformbutton}
                                    setTextformbutton={setTextformbutton}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Modal Crear Usuario — solo instructores */}
                <div className="modal fade" id="modalRegister" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #E8A0A8, #C97A85)' }}>
                                <h1 className="modal-title fs-5 text-white">👤 Crear nuevo usuario</h1>
                                <button type="button" className="btn-close btn-close-white"
                                    data-bs-dismiss="modal" id="closeModalRegister"></button>
                            </div>
                            <div className="modal-body">
                                <RegisterUsuario
                                    hideModal={hideModalRegister}
                                    refreshTable={getALLResponsables}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudResponsables;