import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import ColectaForm from "./colectaForm.jsx";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import { customTableStyles } from "../../styles/tableStyles.js";
import {
    TbFlask,
    TbSearch,
    TbPlus,
    TbPencil,
    TbTrash
} from "react-icons/tb";
import { formatearFecha, getEstadoVigenciaColecta } from "../../utils/dateUtils.js";
import { ModalResponsables, BotonResponsables } from "../../components/ModalResponsables.jsx";
import { getListaResponsables } from "../../utils/responsablesUtils.js";

const CrudColecta = () => {
    const MySwal = WithReactContent(Swal);
    const navigate = useNavigate();
    const location = useLocation();
    const filtroDesdeInseminacion = location.state && location.state.Id_colecta ? location.state : null;

    const [colectas, setColectas] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [rowToEdit, setRowToEdit] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [modalResponsablesData, setModalResponsablesData] = useState(null);



    const hideModal = () => {
        const btn = document.getElementById("closeModal");
        if (btn) btn.click();
    };

    const getNombresResponsables = (Id_Responsable) => {
        if (!Id_Responsable || responsables.length === 0) return "—";
        try {
            let ids = [];
            if (typeof Id_Responsable === "string" && Id_Responsable.startsWith("[")) {
                ids = JSON.parse(Id_Responsable).map(Number);
            } else {
                ids = [Number(Id_Responsable)];
            }
            return ids
                .map((id) => {
                    const r = responsables.find((resp) => resp.Id_Responsable === id);
                    return r ? `${r.Nombres} ${r.Apellidos}` : `#${id}`;
                })
                .join(", ");
        } catch {
            return Id_Responsable;
        }
    };

    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: "¿Estás seguro?",
            text: `Se eliminará la colecta #${row.Id_colecta} permanentemente.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.delete("/colectas/" + row.Id_colecta);
                MySwal.fire({ icon: "success", title: "Eliminado", text: "Colecta eliminada correctamente" });
                getAllColectas();
            } catch (error) {
                MySwal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
            }
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            await Promise.all([getAllColectas(), getResponsables()]);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    const getAllColectas = async () => {
        try {
            const response = await apiAxios.get("/colectas/");
            const sortedData = (response.data || []).sort(
                (a, b) => new Date(b.Fecha || 0) - new Date(a.Fecha || 0)
            );
            setColectas(sortedData);
        } catch (error) {
            console.error("Error al obtener colectas:", error);
        }
    };

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get("/responsables/");
            setResponsables(response.data || []);
        } catch (error) {
            console.error("Error al obtener responsables:", error);
        }
    };

    // Colectas base (aplica filtro si proviene de inseminación)
    const colectasBase = useMemo(() => {
        return filtroDesdeInseminacion
            ? colectas.filter((c) => String(c.Id_colecta) === String(filtroDesdeInseminacion.Id_colecta))
            : colectas;
    }, [colectas, filtroDesdeInseminacion]);

    // Filtro DataTable
    const listColectasParaTabla = useMemo(() => {
        if (!filterText.trim()) return colectasBase;
        const text = filterText.toLowerCase().trim();
        return colectasBase.filter((item) => {
            const id = item.Id_colecta?.toString() || "";
            const fecha = item.Fecha?.toString().toLowerCase() || "";
            const porcino = item.porcino?.Nom_Porcino?.toLowerCase() || item.Id_Porcino?.toString() || "";
            const chapeta = item.porcino?.Num_Chapeta?.toString().toLowerCase() || "";
            const resps = getNombresResponsables(item.Id_Responsable).toLowerCase();
            const obs = item.Observaciones?.toLowerCase() || "";
            const color = item.color?.toLowerCase() || "";
            const olor = item.olor?.toLowerCase() || "";

            return (
                id.includes(text) ||
                fecha.includes(text) ||
                porcino.includes(text) ||
                chapeta.includes(text) ||
                resps.includes(text) ||
                obs.includes(text) ||
                color.includes(text) ||
                olor.includes(text)
            );
        });
    }, [colectasBase, filterText, responsables]);

    // Columnas DataTable
    const columnsTable = [
        {
            name: "ID Colecta",
            selector: (row) => row.Id_colecta,
            width: "90px",
            sortable: true,
            cell: (row) => (
                <span className="font-mono font-bold text-gray-800 text-xs">
                    #{row.Id_colecta}
                </span>
            )
        },
        {
            name: "Fecha",
            selector: (row) => row.Fecha,
            sortable: true,
            width: "120px",
            cell: (row) => (
                <span className="font-semibold text-gray-700 text-xs">
                    {formatearFecha(row.Fecha)}
                </span>
            )
        },
        {
            name: "Estado / Vigencia",
            width: "170px",
            cell: (row) => {
                const vig = getEstadoVigenciaColecta(row);
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${vig.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vig.dotClass}`}></span>
                        {vig.label}
                    </span>
                );
            }
        },
        {
            name: "Macho Donante",
            minWidth: "180px",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        ♂
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-xs">
                            {row.porcino?.Nom_Porcino || (row.Id_Porcino ? `Macho #${row.Id_Porcino}` : "Donante Externo")}
                        </div>
                        {row.porcino?.Num_Chapeta && (
                            <span className="inline-block px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                Chap: {row.porcino.Num_Chapeta}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            name: "Tipo / Origen",
            width: "110px",
            cell: (row) => {
                const esInterno = (row.Tipo || "").toLowerCase() === "interno";
                return (
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${esInterno ? "bg-sky-100 text-sky-800" : "bg-purple-100 text-purple-800"
                            }`}
                    >
                        {row.Tipo || "Interno"}
                    </span>
                );
            }
        },
        {
            name: "Disponibilidad de Pajillas",
            minWidth: "190px",
            cell: (row) => {
                const gen = Number(row.cant_generada) || 0;
                const uti = Number(row.cant_utilizada) || 0;
                const disp = Math.max(0, gen - uti);
                const pct = gen > 0 ? (disp / gen) * 100 : 0;
                const vig = getEstadoVigenciaColecta(row);

                return (
                    <div className="w-full max-w-[160px] flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px]">
                            <span className={`font-bold ${vig.isVencida ? "text-red-600 line-through" : "text-gray-800"}`}>
                                {disp} / {gen} disp
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">{uti} usadas</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-1.5 rounded-full transition-all ${vig.isVencida ? "bg-red-500" : disp <= 0 ? "bg-gray-400" : disp <= 2 ? "bg-amber-500" : "bg-emerald-500"
                                    }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                            ></div>
                        </div>
                        {vig.isVencida && disp > 0 && (
                            <span className="text-[10px] font-semibold text-red-600">
                                {disp} pajilla(s) descartada(s) por vencimiento
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            name: "Calidad Seminal",
            width: "140px",
            cell: (row) => (
                <div className="text-[11px] text-gray-600 flex flex-col">
                    <span>Vol: <strong>{row.volumen || "—"} ml</strong></span>
                    <span className="text-[10px] text-gray-500">{row.color || "—"} / {row.olor || "—"}</span>
                </div>
            )
        },
        {
            name: "Responsables",
            minWidth: "160px",
            cell: (row) => {
                const lista = getListaResponsables(row.Id_Responsable, responsables);
                return (
                    <BotonResponsables
                        lista={lista}
                        theme="blue"
                        onClick={() =>
                            setModalResponsablesData({
                                titulo: "Responsables de Colecta",
                                subtitulo: `Colecta #${row.Id_colecta} — ${formatearFecha(row.Fecha)}`,
                                responsables: lista,
                                theme: "blue"
                            })
                        }
                    />
                );
            }
        },
        {
            name: "Acciones",
            width: "90px",
            cell: (row) => (
                <div className="flex gap-1.5 items-center justify-end w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        onClick={() => setRowToEdit(row)}
                        data-bs-toggle="modal"
                        data-bs-target="#colectaModal"
                        title="Editar colecta"
                    >
                        <TbPencil size={15} />
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        onClick={() => handleDelete(row)}
                        title="Eliminar colecta"
                    >
                        <TbTrash size={15} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">
            {/* Banner si viene filtrado desde Inseminación */}
            {filtroDesdeInseminacion && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            🧪
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-900 m-0 text-sm md:text-base">
                                Detalle de Colecta #{filtroDesdeInseminacion.Id_colecta}
                            </h5>
                            <p className="text-xs text-gray-600 m-0">
                                Lote seminal vinculado desde procedimiento de inseminación
                            </p>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-semibold shadow-sm transition-all"
                        onClick={() => navigate(-1)}
                    >
                        ← Volver a Inseminaciones
                    </button>
                </div>
            )}

            {/* Cabecera Principal */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                        <TbFlask className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Panel de Colectas Seminales
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Control de dosis producidas, pajillas consumidas, saldo disponible y alertas de
                            vencimiento para garantizar la máxima viabilidad reproductiva.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-md shadow-purple-500/20 px-5 py-2.5 text-sm hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95"
                    data-bs-toggle="modal"
                    data-bs-target="#colectaModal"
                    onClick={() => setRowToEdit({})}
                >
                    <TbPlus className="w-5 h-5" />
                    <span>Nueva Colecta</span>
                </button>
            </div>

            {/* Tabla Detallada de Colectas */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h5 className="font-bold text-gray-900 m-0">Listado de Colectas</h5>
                        <p className="text-xs text-gray-500 m-0">
                            Mostrando {listColectasParaTabla.length} de {colectas.length} colectas registradas
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none z-10" />
                        <input
                            type="text"
                            className="form-control form-control-sm search-input-with-icon rounded-2xl text-xs py-2.5 shadow-sm focus:border-sky-500"
                            placeholder="Buscar por lote, donante, aspecto u observaciones..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columnsTable}
                    data={listColectasParaTabla}
                    keyField="Id_colecta"
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    highlightOnHover
                    customStyles={customTableStyles}
                    noDataComponent={
                        <div className="py-12 text-center text-gray-400 text-xs">
                            No se encontraron colectas que coincidan con los criterios seleccionados.
                        </div>
                    }
                />
            </div>

            {/* Modal de Registro / Edición de Colecta */}
            <div className="modal fade" id="colectaModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-3xl border-0 shadow-2xl overflow-hidden">
                        <div className="modal-header bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 py-3.5 px-5">
                            <div className="flex items-center gap-2">
                                <TbFlask className="text-xl" />
                                <h1 className="modal-title fs-6 font-bold m-0">
                                    {rowToEdit.Id_colecta ? `Editar Colecta #${rowToEdit.Id_colecta}` : "Nueva Colecta Seminal"}
                                </h1>
                            </div>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                id="closeModal"
                            ></button>
                        </div>
                        <div className="modal-body p-5">
                            <ColectaForm
                                hideModal={hideModal}
                                rowToEdit={rowToEdit}
                                refreshTable={getAllColectas}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Responsables */}
            <ModalResponsables
                data={modalResponsablesData}
                onClose={() => setModalResponsablesData(null)}
            />
        </div>
    );
};

export default CrudColecta;