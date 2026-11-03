import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from 'react-data-table-component';
import NovedadesForm from "./NovedadesForm.jsx";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { customTableStyles } from "../../styles/tableStyles.js";
import { formatearFecha } from "../../utils/dateUtils.js";
import {
    TbAlertTriangle,
    TbSearch,
    TbPlus,
    TbPencil,
    TbTrash
} from "react-icons/tb";

const CrudNovedades = () => {
    const MySwal = withReactContent(Swal);

    const [novedades, setNovedades] = useState([]);
    const [novedadEdit, setNovedadEdit] = useState(null);
    const [filterText, setFilterText] = useState('');

    const [porcinosMap, setPorcinosMap] = useState({});

    const columns = [
        {
            name: 'ID',
            selector: row => row.Id_Novedad,
            sortable: true,
            width: '80px',
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    #{row.Id_Novedad}
                </span>
            )
        },
        {
            name: 'Porcino',
            selector: row => row.porcino?.Nom_Porcino || porcinosMap[row.Id_Porcino]?.Nom_Porcino || `Porcino #${row.Id_Porcino}`,
            sortable: true,
            minWidth: '170px',
            cell: row => {
                const p = row.porcino || porcinosMap[row.Id_Porcino];
                const nombre = p?.Nom_Porcino || (p?.Num_Chapeta ? `Chapeta: ${p.Num_Chapeta}` : `Porcino #${row.Id_Porcino}`);
                const sub = p?.Num_Chapeta ? `Chapeta: ${p.Num_Chapeta}` : (row.Id_Porcino ? `ID: #${row.Id_Porcino}` : '');
                return (
                    <div className="flex items-center gap-2.5 py-1">
                        <div>
                            <div className="font-bold text-gray-900 text-xs">
                                {nombre}
                            </div>
                            {sub && (
                                <div className="text-[11px] text-gray-400">
                                    {sub}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            name: 'Tipo de Novedad',
            selector: row => row.Tipo_Novedad,
            sortable: true,
            width: '160px',
            cell: row => {
                let badgeClass = 'bg-gray-50 text-gray-700 border-gray-200';
                if (row.Tipo_Novedad === 'Muerte' || row.Tipo_Novedad === 'Descarte') {
                    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                } else if (row.Tipo_Novedad === 'Enfermedad' || row.Tipo_Novedad === 'Lesión') {
                    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                } else if (row.Tipo_Novedad === 'Traslado') {
                    badgeClass = 'bg-sky-50 text-sky-700 border-sky-200';
                }
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                        {row.Tipo_Novedad}
                    </span>
                );
            }
        },
        {
            name: 'Fecha',
            selector: row => row.Fecha_Novedad,
            sortable: true,
            width: '120px',
            cell: row => <span className="text-xs font-medium text-gray-800">{formatearFecha(row.Fecha_Novedad) || '—'}</span>
        },
        {
            name: 'Causa / Motivo',
            selector: row => row.Causa_Motivo || '—',
            width: '150px',
            cell: row => <span className="text-xs font-medium text-gray-700">{row.Causa_Motivo || '—'}</span>
        },
        {
            name: "Observaciones",
            selector: row => row.Observaciones || "—",
            cell: row => (
                <div
                    style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebKitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}
                    className="text-xs text-gray-600"
                    title={row.Observaciones || ""}
                >
                    {row.Observaciones || "—"}
                </div>
            ),
            wrap: true,
            minWidth: "180px",
            grow: 2
        },
        {
            name: 'Acciones',
            width: '110px',
            center: true,
            cell: row => (
                <div className="flex items-center justify-center w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-xs"
                        title="Editar Novedad"
                        onClick={() => handleEdit(row)}
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        getAllNovedades();
    }, []);

    const getAllNovedades = async () => {
        try {
            const [response, resPorcinos] = await Promise.all([
                apiAxios.get('/novedades/'),
                apiAxios.get('/porcino/').catch(() => ({ data: [] }))
            ]);

            const map = {};
            (resPorcinos.data || []).forEach(p => {
                map[p.Id_Porcino] = p;
            });
            setPorcinosMap(map);

            const sortedData = (response.data || []).sort((a, b) => new Date(b.Fecha_Novedad) - new Date(a.Fecha_Novedad));
            setNovedades(sortedData);
        } catch (error) {
            console.error("Error al obtener novedades:", error);
        }
    };

    const filteredNovedades = novedades.filter(nov => {
        const searchText = filterText.toLowerCase();
        const tipo = nov.Tipo_Novedad?.toLowerCase() || '';
        const causa = nov.Causa_Motivo?.toLowerCase() || '';
        const obs = nov.Observaciones?.toLowerCase() || '';
        const porcino = nov.porcino?.Nom_Porcino?.toLowerCase() || '';

        return tipo.includes(searchText) ||
            causa.includes(searchText) ||
            obs.includes(searchText) ||
            porcino.includes(searchText);
    });

    const hideModal = () => {
        setNovedadEdit(null);
        document.getElementById('closeModalNovedades')?.click();
    };

    useEffect(() => {
        const modalEl = document.getElementById('modalNovedades');
        if (!modalEl) return;
        const handleHidden = () => {
            setNovedadEdit(null);
        };
        modalEl.addEventListener('hidden.bs.modal', handleHidden);
        return () => modalEl.removeEventListener('hidden.bs.modal', handleHidden);
    }, []);

    const handleEdit = (novedad) => {
        setNovedadEdit(novedad);
        const modal = new bootstrap.Modal(document.getElementById('modalNovedades'));
        modal.show();
    };

    return (
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                        <TbAlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Registro de Novedades</h1>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                                {filteredNovedades.length} novedades
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Control de incidencias sanitarias, descartes, traslados y decesos</p>
                    </div>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm shadow-md hover:from-amber-700 hover:to-orange-700 hover:shadow-lg transition-all duration-200"
                    data-bs-toggle="modal"
                    data-bs-target="#modalNovedades"
                    onClick={() => setNovedadEdit(null)}
                >
                    <TbPlus className="w-5 h-5" />
                    <span>Registrar Novedad</span>
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Listado de Novedades</h2>
                        <p className="text-xs text-gray-400">Historial cronológico de eventos e incidencias</p>
                    </div>
                    <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Buscar por porcino, tipo, causa..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredNovedades}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    customStyles={customTableStyles}
                    noDataComponent={
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No hay novedades registradas
                        </div>
                    }
                />
            </div>

            <div className="modal fade" id="modalNovedades" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">
                                {novedadEdit ? "Editar Novedad" : "Registrar Nueva Novedad"}
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                id="closeModalNovedades"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <NovedadesForm
                                key={novedadEdit ? novedadEdit.Id_Novedad : 'new'}
                                hideModal={hideModal}
                                novedadEdit={novedadEdit}
                                reload={getAllNovedades}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudNovedades;
