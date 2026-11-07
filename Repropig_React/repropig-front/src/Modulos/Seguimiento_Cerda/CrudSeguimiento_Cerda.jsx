import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { customTableStyles } from "../../styles/tableStyles.js";
import Seguimiento_CerdaForm from "./Seguimiento_CerdaForm.jsx";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import { ModalResponsables, BotonResponsables } from "../../components/ModalResponsables.jsx";
import { getListaResponsables } from "../../utils/responsablesUtils.js";
import {
    TbNotes,
    TbSearch,
    TbPlus,
    TbPencil,
    TbArrowLeft
} from "react-icons/tb";

const CrudSeguimiento_Cerda = () => {
    // ==========================================
    // ESTADOS
    // ==========================================
    const [Seguimiento_Cerda, setSeguimiento_Cerda] = useState([]);
    const [porcinos, setPorcinos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [tiposActividad, setTiposActividad] = useState([]);
    const [Seguimiento_CerdaEdit, setSeguimiento_CerdaEdit] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [modalKey, setModalKey] = useState(0);
    const [modalResponsablesData, setModalResponsablesData] = useState(null);

    const { id: partoIdParams } = useParams();
    const navigate = useNavigate();
    const MySwal = WithReactContent(Swal);

    // ==========================================
    // CARGA DE DATOS Y CATÁLOGOS
    // ==========================================
    const getAllSeguimiento_Cerda = async () => {
        try {
            const url = partoIdParams
                ? `/Seguimiento_Cerda/parto/${partoIdParams}`
                : "/Seguimiento_Cerda";

            const results = await Promise.allSettled([
                apiAxios.get(url),
                apiAxios.get("/porcino/"),
                apiAxios.get("/responsables/"),
                apiAxios.get("/medicamentos/"),
                apiAxios.get("/tipos_actividad/")
            ]);

            const [segRes, porcRes, respRes, medRes, tipRes] = results;

            if (segRes.status === "fulfilled") {
                setSeguimiento_Cerda(Array.isArray(segRes.value.data) ? segRes.value.data : []);
            } else {
                console.error("Error cargando Seguimiento_Cerda:", segRes.reason);
                setSeguimiento_Cerda([]);
            }

            if (porcRes.status === "fulfilled") {
                setPorcinos(Array.isArray(porcRes.value.data) ? porcRes.value.data : []);
            }

            if (respRes.status === "fulfilled") {
                setResponsables(Array.isArray(respRes.value.data) ? respRes.value.data : []);
            }

            if (medRes.status === "fulfilled") {
                setMedicamentos(Array.isArray(medRes.value.data) ? medRes.value.data : []);
            }

            if (tipRes && tipRes.status === "fulfilled") {
                setTiposActividad(Array.isArray(tipRes.value.data) ? tipRes.value.data : []);
            }
        } catch (error) {
            console.error("Error general al obtener seguimientos:", error);
            setSeguimiento_Cerda([]);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar los seguimientos."
            });
        }
    };
    // ==========================================
    // CARGAR AL INICIAR
    // ==========================================


    useEffect(() => {
        getAllSeguimiento_Cerda();
    }, [partoIdParams]);

    // ==========================================
    // MAPAS DE BÚSQUEDA Y UTILIDADES
    // ==========================================
    const porcinosMap = useMemo(() => {
        const map = {};
        porcinos.forEach(p => {
            if (p && p.Id_Porcino != null) {
                map[String(p.Id_Porcino)] = p;
            }
        });
        return map;
    }, [porcinos]);

    const responsablesMap = useMemo(() => {
        const map = {};
        responsables.forEach(r => {
            if (r && r.Id_Responsable != null) {
                map[String(r.Id_Responsable)] = r;
            }
        });
        return map;
    }, [responsables]);

    const medicamentosMap = useMemo(() => {
        const map = {};
        medicamentos.forEach(m => {
            if (m && m.Id_Medicamento != null) {
                map[String(m.Id_Medicamento)] = m;
            }
        });
        return map;
    }, [medicamentos]);

    const tiposActividadMap = useMemo(() => {
        const map = {};
        tiposActividad.forEach(t => {
            if (t && t.Id_Tipo != null) {
                map[String(t.Id_Tipo)] = t;
            }
        });
        return map;
    }, [tiposActividad]);

    // Extrae IDs de campos que pueden venir como número, string, array o JSON string
    const parseIds = (val) => {
        if (val === null || val === undefined || val === "") return [];
        if (Array.isArray(val)) return val.map(String).filter(Boolean);
        if (typeof val === "number") return [String(val)];
        if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed.map(String).filter(Boolean);
                    }
                } catch (e) { }
            }
            if (trimmed.includes(",")) {
                return trimmed.split(",").map(s => s.trim()).filter(Boolean);
            }
            return [trimmed];
        }
        return [String(val)];
    };

    const getResponsablesNames = (val) => {
        const ids = parseIds(val);
        if (!ids.length) return [];
        return ids.map(id => {
            const r = responsablesMap[id];
            if (r) {
                const nombreCompleto = `${r.Nombres || ""} ${r.Apellidos || ""}`.trim();
                return nombreCompleto || `Responsable #${id}`;
            }
            return `Responsable #${id}`;
        });
    };

    const getMedicamentosNames = (val) => {
        const ids = parseIds(val);
        if (!ids.length) return [];
        return ids.map(id => {
            const m = medicamentosMap[id];
            if (m) {
                return m.Nombre || `Medicamento #${id}`;
            }
            return `Medicamento #${id}`;
        });
    };

    const formatFecha = (fechaRaw) => {
        if (!fechaRaw) return "—";
        const datePart = String(fechaRaw).split("T")[0];
        const parts = datePart.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return datePart;
    };

    // ==========================================
    // MODAL EDITAR / NUEVO / CERRAR
    // ==========================================
    const handleEdit = (row) => {
        setSeguimiento_CerdaEdit(row);
        setModalKey(prev => prev + 1);
        const modalElement = document.getElementById("exampleModal");
        if (modalElement) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        }
    };

    const handleNuevo = () => {
        setSeguimiento_CerdaEdit(null);
        setModalKey(prev => prev + 1);
        setTimeout(() => {
            const modalElement = document.getElementById("exampleModal");
            if (modalElement) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                modal.show();
            }
        }, 0);
    };

    const hideModal = () => {
        setSeguimiento_CerdaEdit(null);
        setModalKey(prev => prev + 1);
        const modalElement = document.getElementById("exampleModal");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
    };

    // ==========================================
    // FILTRO INTELIGENTE
    // ==========================================
    const newListSeguimiento_Cerda = useMemo(() => {
        const query = filterText.toLowerCase().trim();
        if (!query) return Seguimiento_Cerda;

        return Seguimiento_Cerda.filter(row => {
            const fechaStr = formatFecha(row.Fecha).toLowerCase();
            const rawFecha = String(row.Fecha || "").toLowerCase();
            const horaStr = String(row.Hora || "").toLowerCase();
            const obs = String(row.Observaciones || "").toLowerCase();

            // Actividad
            const nomActividad = String(
                row.tipo_actividad?.Nombre || tiposActividadMap[String(row.Id_Tipo)]?.Nombre || ""
            ).toLowerCase();

            // Cerda
            const cerda = porcinosMap[String(row.Id_Porcino)];
            const nomCerda = String(cerda?.Nom_Porcino || "").toLowerCase();
            const chapeta = String(cerda?.Num_Chapeta || "").toLowerCase();
            const idPorcino = String(row.Id_Porcino || "").toLowerCase();

            // Responsables
            const respNames = getResponsablesNames(row.Id_Responsable).join(" ").toLowerCase();

            // Medicamentos
            const medNames = getMedicamentosNames(row.Id_Medicamento).join(" ").toLowerCase();

            return (
                nomCerda.includes(query) ||
                chapeta.includes(query) ||
                idPorcino.includes(query) ||
                nomActividad.includes(query) ||
                respNames.includes(query) ||
                medNames.includes(query) ||
                fechaStr.includes(query) ||
                rawFecha.includes(query) ||
                horaStr.includes(query) ||
                obs.includes(query)
            );
        });
    }, [Seguimiento_Cerda, filterText, porcinosMap, responsablesMap, medicamentosMap, tiposActividadMap]);

    // ==========================================
    // COLUMNAS (Sin columna Id)
    // ==========================================
    const columnsTable = [
        {
            name: "Fecha",
            selector: row => row.Fecha || "",
            sortable: true,
            cell: row => {
                let horaFormateada = "";
                if (row.Hora) {
                    const [horas, minutos] = String(row.Hora).split(":");
                    let hora = parseInt(horas);
                    const periodo = hora >= 12 ? "PM" : "AM";
                    hora = hora % 12;
                    if (hora === 0) hora = 12;
                    horaFormateada = `${String(hora).padStart(2, "0")}:${minutos} ${periodo}`;
                }
                return (
                    <div className="py-1">
                        <div className="text-xs font-medium text-gray-800">{formatFecha(row.Fecha)}</div>
                        {horaFormateada && <div className="text-[11px] text-gray-400">{horaFormateada}</div>}
                    </div>
                );
            },
            width: "125px"
        },
        {
            name: "Cerda",
            selector: row => {
                const p = porcinosMap[String(row.Id_Porcino)];
                return p ? p.Nom_Porcino : String(row.Id_Porcino || "");
            },
            sortable: true,
            cell: row => {
                const p = porcinosMap[String(row.Id_Porcino)];
                return (
                    <div className="flex items-center gap-2.5 py-1">
                        <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                            ♀
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 text-xs">
                                {p ? p.Nom_Porcino : (row.Id_Porcino ? `Cerda #${row.Id_Porcino}` : "—")}
                            </div>
                            <div className="text-[11px] text-gray-400">
                                {p?.Num_Chapeta ? `Chapeta: ${p.Num_Chapeta}` : (row.Id_Porcino ? `ID: #${row.Id_Porcino}` : '')}
                            </div>
                        </div>
                    </div>
                );
            },
            minWidth: "170px"
        },
        {
            name: "Actividad",
            selector: row => row.tipo_actividad?.Nombre || tiposActividadMap[String(row.Id_Tipo)]?.Nombre || "",
            sortable: true,
            cell: row => {
                const nombreTipo = row.tipo_actividad?.Nombre || tiposActividadMap[String(row.Id_Tipo)]?.Nombre;
                return nombreTipo ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/80">
                        {nombreTipo}
                    </span>
                ) : (
                    <span className="text-gray-400 text-xs">—</span>
                );
            },
            minWidth: "160px"
        },
        {
            name: "Responsables",
            minWidth: "160px",
            cell: row => {
                const lista = getListaResponsables(row.Id_Responsable, responsables);
                return (
                    <BotonResponsables
                        lista={lista}
                        theme="pink"
                        onClick={() =>
                            setModalResponsablesData({
                                titulo: "Responsables del Seguimiento",
                                subtitulo: `Seguimiento #${row.Id_Seguimiento_Cerda} — ${row.Fecha || ""}`,
                                responsables: lista,
                                theme: "pink"
                            })
                        }
                    />
                );
            },
        },
        {
            name: "Medicamentos",
            cell: row => {
                const meds = getMedicamentosNames(row.Id_Medicamento);
                if (!meds.length) return <span className="text-gray-400 text-xs">—</span>;
                return (
                    <div className="flex flex-wrap gap-1 py-1">
                        {meds.map((nom, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                            >
                                {nom}
                            </span>
                        ))}
                    </div>
                );
            },
            minWidth: "170px",
            wrap: true
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
            minWidth: "200px",
            grow: 2
        },
        {
            name: "Acciones",
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
            ),
            width: "80px"
        }
    ];

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {partoIdParams && (
                        <button
                            onClick={() => navigate("/partos")}
                            className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 transition-colors shadow-xs"
                            title="Volver a Partos"
                        >
                            <TbArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                        <TbNotes className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                {partoIdParams ? `Seguimiento de Cerda (Parto #${partoIdParams})` : "Seguimiento Diario de Cerdas"}
                            </h1>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/60">
                                {newListSeguimiento_Cerda.length} registros
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Control clínico diario, medicaciones y observaciones por cerda</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleNuevo}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-md hover:from-pink-700 hover:to-rose-700 hover:shadow-lg transition-all duration-200"
                >
                    <TbPlus className="w-5 h-5" />
                    <span>Registrar Seguimiento</span>
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Listado de Seguimientos</h2>
                        <p className="text-xs text-gray-400">Trazabilidad sanitaria de cerdas y tratamientos</p>
                    </div>
                    <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder:text-gray-400"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            placeholder="Buscar por cerda, actividad, responsable, medicamento..."
                        />
                    </div>
                </div>

                <DataTable
                    columns={columnsTable}
                    data={newListSeguimiento_Cerda}
                    keyField="Id_Seguimiento_Cerda"
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    customStyles={customTableStyles}
                    noDataComponent={
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No hay registros de seguimiento para esta cerda
                        </div>
                    }
                />
            </div>

            {/* MODAL FORMULARIO */}
            <div
                className="modal fade"
                id="exampleModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">
                                {Seguimiento_CerdaEdit
                                    ? "Editar Seguimiento"
                                    : "Agregar Seguimiento"}
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={hideModal}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <Seguimiento_CerdaForm
                                key={modalKey}
                                hideModal={hideModal}
                                Seguimiento_CerdaEdit={Seguimiento_CerdaEdit}
                                reload={getAllSeguimiento_Cerda}
                                partoIdParams={partoIdParams}
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

export default CrudSeguimiento_Cerda;