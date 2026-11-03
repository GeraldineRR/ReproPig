import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import MontaForm from "./montaForm.jsx";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import { customTableStyles } from "../../styles/tableStyles.js";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Cell
} from "recharts";
import {
    TbHeart,
    TbPig,
    TbGenderMale,
    TbRefresh,
    TbFilter,
    TbCalendar,
    TbSearch,
    TbPlus,
    TbExternalLink,
    TbChartBar,
    TbX,
    TbInfoCircle,
    TbCheck,
    TbBan,
    TbPencil,
    TbTrash,
    TbArrowLeft,
    TbUsers
} from "react-icons/tb";
import { formatearFecha, formatearHora } from "../../utils/dateUtils.js";
import { agruparDatosEvolucion } from "../../utils/chartGroupingUtils.js";

const CrudMonta = () => {
    const { usuario } = useAuth();
    const isInstructor = (usuario?.Cargo || usuario?.cargo || usuario?.Rol || usuario?.rol || "").toLowerCase().includes("instructor");

    const MySwal = WithReactContent(Swal);
    const navigate = useNavigate();
    const location = useLocation();
    const filtroDesdeCiclo = (location.state && location.state.Id_Ciclo) ? location.state : null;

    const [montas, setMontas] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [ciclos, setCiclos] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [rowToEdit, setRowToEdit] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [modalResponsablesData, setModalResponsablesData] = useState(null);

    // Filtros estadísticos
    const [filtroPeriodo, setFiltroPeriodo] = useState("all"); // 'all' | '30d' | '90d' | 'year' | 'custom'
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filtroMacho, setFiltroMacho] = useState("all");
    const [filtroCerda, setFiltroCerda] = useState("all");
    const [filtroEstadoCiclo, setFiltroEstadoCiclo] = useState("all");

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

    const getListaResponsables = (Id_Responsable) => {
        if (!Id_Responsable || responsables.length === 0) return [];
        try {
            let ids = [];
            if (typeof Id_Responsable === "string" && Id_Responsable.startsWith("[")) {
                ids = JSON.parse(Id_Responsable).map(Number);
            } else {
                ids = [Number(Id_Responsable)];
            }
            return ids.map((id) => {
                const r = responsables.find((resp) => resp.Id_Responsable === id);
                return (
                    r || {
                        Id_Responsable: id,
                        Nombres: `Responsable #${id}`,
                        Apellidos: "",
                        Cargo: "Personal asignado"
                    }
                );
            });
        } catch {
            return [];
        }
    };

    const renderModalResponsables = () => {
        if (!modalResponsablesData) return null;
        const { monta, responsables: lista } = modalResponsablesData;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-scaleUp">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                                <TbUsers className="text-xl text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm m-0 leading-tight">Responsables Asignados</h4>
                                <p className="text-[11px] text-pink-100 m-0">
                                    {monta?.Fec_hora
                                        ? `${formatearFecha(monta.Fec_hora)} ${formatearHora(monta.Fec_hora)}`
                                        : "Servicio de Monta"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setModalResponsablesData(null)}
                            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            title="Cerrar"
                        >
                            <TbX size={18} />
                        </button>
                    </div>

                    <div className="p-5 max-h-80 overflow-y-auto space-y-2.5">
                        {lista.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4">No hay responsables asociados a esta monta.</p>
                        ) : (
                            lista.map((resp, idx) => (
                                <div
                                    key={resp.Id_Responsable || idx}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-pink-50/40 border border-gray-100 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                                        {resp.Nombres ? resp.Nombres.charAt(0).toUpperCase() : "R"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h6 className="text-xs font-bold text-gray-800 m-0 truncate">
                                            {resp.Nombres} {resp.Apellidos || ""}
                                        </h6>
                                        <p className="text-[11px] text-gray-500 m-0 truncate">
                                            {resp.Cargo || resp.cargo || resp.Rol || resp.rol || "Personal responsable"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setModalResponsablesData(null)}
                            className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const toggleEstado = async (row) => {
        const esActivo = row.Estado === "Activo" || row.Estado === "A" || !row.Estado;
        const accion = esActivo ? "inactivar" : "activar";

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} esta monta?`,
            text: `La monta #${row.Id_Monta} pasará a estar ${esActivo ? "Inactiva" : "Activa"}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: esActivo ? "#d33" : "#198754",
            cancelButtonColor: "#6c757d",
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/monta/${row.Id_Monta}/toggle-estado`);
                MySwal.fire({ icon: "success", title: "Estado actualizado", timer: 1500, showConfirmButton: false });
                getAllMontas();
            } catch {
                try {
                    const nuevoEstado = esActivo ? "Inactivo" : "Activo";
                    await apiAxios.put(`/monta/${row.Id_Monta}`, { ...row, Estado: nuevoEstado });
                    MySwal.fire({ icon: "success", title: "Estado actualizado", timer: 1500, showConfirmButton: false });
                    getAllMontas();
                } catch {
                    MySwal.fire({ icon: "error", title: "Error", text: "No se pudo cambiar el estado." });
                }
            }
        }
    };

    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: "¿Estás seguro?",
            text: `Se eliminará la monta #${row.Id_Monta} permanentemente.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });
        if (result.isConfirmed) {
            try {
                await apiAxios.delete("/monta/" + row.Id_Monta);
                MySwal.fire({ icon: "success", title: "Eliminado", text: "Monta eliminada correctamente" });
                getAllMontas();
            } catch (error) {
                MySwal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
            }
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            await Promise.all([getAllMontas(), getResponsables(), getCiclos()]);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    const getAllMontas = async () => {
        try {
            const response = await apiAxios.get("/monta/");
            const sortedData = (response.data || []).sort(
                (a, b) => new Date(b.Fec_hora || 0) - new Date(a.Fec_hora || 0)
            );
            setMontas(sortedData);
        } catch (error) {
            console.error("Error al obtener montas:", error);
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

    const getCiclos = async () => {
        try {
            const response = await apiAxios.get("/ciclos/");
            setCiclos(response.data || []);
        } catch (error) {
            console.error("Error al obtener ciclos:", error);
        }
    };

    // Listas únicas para los selectores de filtros
    const machosDisponibles = useMemo(() => {
        const map = new Map();
        montas.forEach((m) => {
            if (m.Id_Cerdo) {
                const nombre = m.cerdo?.Nom_Porcino
                    ? `${m.cerdo.Nom_Porcino} ${m.cerdo.Num_Chapeta ? `(#${m.cerdo.Num_Chapeta})` : ""}`
                    : `Macho #${m.Id_Cerdo}`;
                map.set(m.Id_Cerdo, nombre);
            }
        });
        return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [montas]);

    const cerdasDisponibles = useMemo(() => {
        const map = new Map();
        montas.forEach((m) => {
            if (m.Id_Porcino) {
                const nombre = m.porcino?.Nom_Porcino
                    ? `${m.porcino.Nom_Porcino} ${m.porcino.Num_Chapeta ? `(#${m.porcino.Num_Chapeta})` : ""}`
                    : `Cerda #${m.Id_Porcino}`;
                map.set(m.Id_Porcino, nombre);
            }
        });
        return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [montas]);

    // Filtro principal de montas (Periodo, Macho, Cerda, Estado Ciclo)
    const montasFiltradasPorEstadisticas = useMemo(() => {
        let base = filtroDesdeCiclo
            ? montas.filter((m) => String(m.Id_Ciclo) === String(filtroDesdeCiclo.Id_Ciclo))
            : montas;

        const ahora = new Date();

        return base.filter((m) => {
            // 1. Filtro por periodo
            if (m.Fec_hora) {
                const fechaM = new Date(m.Fec_hora);
                if (filtroPeriodo === "30d") {
                    const limite = new Date();
                    limite.setDate(ahora.getDate() - 30);
                    if (fechaM < limite) return false;
                } else if (filtroPeriodo === "90d") {
                    const limite = new Date();
                    limite.setDate(ahora.getDate() - 90);
                    if (fechaM < limite) return false;
                } else if (filtroPeriodo === "year") {
                    if (fechaM.getFullYear() !== ahora.getFullYear()) return false;
                } else if (filtroPeriodo === "custom") {
                    if (fechaDesde && new Date(m.Fec_hora.split("T")[0]) < new Date(fechaDesde)) return false;
                    if (fechaHasta && new Date(m.Fec_hora.split("T")[0]) > new Date(fechaHasta)) return false;
                }
            }

            // 2. Filtro por Macho
            if (filtroMacho !== "all" && String(m.Id_Cerdo) !== String(filtroMacho)) {
                return false;
            }

            // 3. Filtro por Cerda
            if (filtroCerda !== "all" && String(m.Id_Porcino) !== String(filtroCerda)) {
                return false;
            }

            // 4. Filtro por Estado Ciclo (Activo, Fallido, Finalizado)
            if (filtroEstadoCiclo !== "all") {
                const cicloAsoc = m.ciclo || ciclos.find((c) => String(c.Id_Ciclo) === String(m.Id_Ciclo));
                let estadoCiclo = (cicloAsoc?.Estado || "").trim().toLowerCase();
                if (!estadoCiclo) {
                    const act = (cicloAsoc?.Activo || cicloAsoc?.activo || "").toUpperCase();
                    estadoCiclo = act === "N" ? "fallido" : "activo";
                }
                if (estadoCiclo !== filtroEstadoCiclo.toLowerCase()) return false;
            }

            return true;
        });
    }, [montas, filtroDesdeCiclo, filtroPeriodo, fechaDesde, fechaHasta, filtroMacho, filtroCerda, filtroEstadoCiclo, ciclos]);

    // KPIs calculados
    const kpis = useMemo(() => {
        const total = montasFiltradasPorEstadisticas.length;
        const cerdasSet = new Set(montasFiltradasPorEstadisticas.map((m) => m.Id_Porcino).filter(Boolean));
        const machosSet = new Set(montasFiltradasPorEstadisticas.map((m) => m.Id_Cerdo).filter(Boolean));
        const ciclosSet = new Set(montasFiltradasPorEstadisticas.map((m) => m.Id_Ciclo).filter(Boolean));

        const promMontasPorCiclo = ciclosSet.size > 0 ? (total / ciclosSet.size).toFixed(1) : "0.0";

        return {
            totalMontas: total,
            cerdasParticipantes: cerdasSet.size,
            machosUtilizados: machosSet.size,
            ciclosConMonta: ciclosSet.size,
            promedioPorCiclo: promMontasPorCiclo
        };
    }, [montasFiltradasPorEstadisticas]);

    // Datos para Gráfica 1: Evolución Temporal Dinámica (Semanas, Meses, Años o Días según periodo)
    const graficaEvolucion = useMemo(() => {
        return agruparDatosEvolucion({
            items: montasFiltradasPorEstadisticas,
            campoFecha: "Fec_hora",
            configPeriodo: { filtroPeriodo, fechaDesde, fechaHasta },
            entidad: "montas"
        });
    }, [montasFiltradasPorEstadisticas, filtroPeriodo, fechaDesde, fechaHasta]);

    // Datos para Gráfica 2: Participación de Machos (Verracos)
    const dataGraficaMachos = useMemo(() => {
        const conteoPorMacho = {};

        montasFiltradasPorEstadisticas.forEach((m) => {
            const id = m.Id_Cerdo || "Sin macho";
            const nombre = m.cerdo?.Nom_Porcino
                ? `${m.cerdo.Nom_Porcino} ${m.cerdo.Num_Chapeta ? `(#${m.cerdo.Num_Chapeta})` : ""}`
                : m.Id_Cerdo
                    ? `Macho #${m.Id_Cerdo}`
                    : "Sin asignar";

            if (!conteoPorMacho[id]) {
                conteoPorMacho[id] = { id, nombre, cantidad: 0 };
            }
            conteoPorMacho[id].cantidad += 1;
        });

        return Object.values(conteoPorMacho)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 8); // Top 8 machos
    }, [montasFiltradasPorEstadisticas]);

    // Datos para Gráfica 3 / Top Cerdas
    const dataGraficaCerdas = useMemo(() => {
        const conteoPorCerda = {};

        montasFiltradasPorEstadisticas.forEach((m) => {
            const id = m.Id_Porcino;
            if (!id) return;
            const nombre = m.porcino?.Nom_Porcino
                ? `${m.porcino.Nom_Porcino} ${m.porcino.Num_Chapeta ? `(#${m.porcino.Num_Chapeta})` : ""}`
                : `Cerda #${id}`;

            if (!conteoPorCerda[id]) {
                conteoPorCerda[id] = { id, nombre, cantidad: 0 };
            }
            conteoPorCerda[id].cantidad += 1;
        });

        return Object.values(conteoPorCerda)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);
    }, [montasFiltradasPorEstadisticas]);

    const limpiarFiltros = () => {
        setFiltroPeriodo("all");
        setFechaDesde("");
        setFechaHasta("");
        setFiltroMacho("all");
        setFiltroCerda("all");
        setFiltroEstadoCiclo("all");
        setFilterText("");
    };

    const hayFiltrosActivos =
        filtroPeriodo !== "all" ||
        filtroMacho !== "all" ||
        filtroCerda !== "all" ||
        filtroEstadoCiclo !== "all" ||
        fechaDesde !== "" ||
        fechaHasta !== "";

    // Filtro del DataTable (buscador por texto sobre los datos ya filtrados)
    const listMontasParaTabla = useMemo(() => {
        if (!filterText.trim()) return montasFiltradasPorEstadisticas;
        const text = filterText.toLowerCase().trim();
        return montasFiltradasPorEstadisticas.filter((item) => {
            const fecha = item.Fec_hora?.toString().toLowerCase() || "";
            const porcino = item.porcino?.Nom_Porcino?.toLowerCase() || item.Id_Porcino?.toString() || "";
            const chapetaHembra = item.porcino?.Num_Chapeta?.toString().toLowerCase() || "";
            const cerdo = item.cerdo?.Nom_Porcino?.toLowerCase() || item.Id_Cerdo?.toString() || "";
            const chapetaMacho = item.cerdo?.Num_Chapeta?.toString().toLowerCase() || "";
            const resps = getNombresResponsables(item.Id_Responsable).toLowerCase();
            const obs = item.Observaciones?.toLowerCase() || "";
            const ciclo = item.Id_Ciclo?.toString() || "";

            return (
                fecha.includes(text) ||
                porcino.includes(text) ||
                chapetaHembra.includes(text) ||
                cerdo.includes(text) ||
                chapetaMacho.includes(text) ||
                resps.includes(text) ||
                obs.includes(text) ||
                ciclo.includes(text)
            );
        });
    }, [montasFiltradasPorEstadisticas, filterText, responsables]);

    // Configuración de columnas para DataTable
    const columnsTable = [
        {
            name: "Fecha y Hora",
            selector: (row) => row.Fec_hora,
            sortable: true,
            minWidth: "150px",
            cell: (row) => {
                if (!row.Fec_hora) return "—";
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-xs">
                            {formatearFecha(row.Fec_hora)}
                        </span>
                        {formatearHora(row.Fec_hora) && (
                            <span className="text-[11px] text-gray-500">
                                {formatearHora(row.Fec_hora)}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            name: "Cerda (Hembra)",
            minWidth: "180px",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                        ♀
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-xs">
                            {row.porcino?.Nom_Porcino || `Cerda #${row.Id_Porcino}`}
                        </div>
                        {row.porcino?.Num_Chapeta && (
                            <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                Chap: {row.porcino.Num_Chapeta}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            name: "Verraco (Macho)",
            minWidth: "180px",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        ♂
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-xs">
                            {row.cerdo?.Nom_Porcino || (row.Id_Cerdo ? `Macho #${row.Id_Cerdo}` : "—")}
                        </div>
                        {row.cerdo?.Num_Chapeta && (
                            <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                Chap: {row.cerdo.Num_Chapeta}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            name: "Ciclo Reproductivo",
            width: "150px",
            cell: (row) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold select-none">
                    <span>Ciclo #{row.Id_Ciclo}</span>
                </span>
            )
        },
        {
            name: "Responsables",
            minWidth: "170px",
            cell: (row) => {
                const lista = getListaResponsables(row.Id_Responsable);
                const count = lista.length;
                if (count === 0) {
                    return <span className="text-gray-400 text-xs italic">Sin responsables</span>;
                }
                return (
                    <button
                        type="button"
                        onClick={() => setModalResponsablesData({ monta: row, responsables: lista })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
                        title="Ver responsables asignados"
                    >
                        <TbUsers className="text-pink-600 group-hover:scale-110 transition-transform text-sm" />
                        <span>{count} {count === 1 ? "Responsable" : "Responsables"}</span>
                    </button>
                );
            }
        },
        {
            name: "Observaciones",
            cell: (row) => (
                <div
                    className="text-xs text-gray-600"
                    style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}
                    title={row.Observaciones || ""}
                >
                    {row.Observaciones || "—"}
                </div>
            ),
            wrap: true,
            minWidth: "180px"
        },
        {
            name: "Acciones",
            width: isInstructor ? "105px" : "65px",
            cell: (row) => {
                let isInactive = false;
                if (filtroDesdeCiclo) {
                    isInactive = (filtroDesdeCiclo.Activo || filtroDesdeCiclo.activo || "").toUpperCase() === "N";
                } else {
                    const rep = ciclos.find((r) => String(r.Id_Ciclo) === String(row.Id_Ciclo));
                    if (rep) {
                        isInactive = (rep.activo || "").toUpperCase() === "N";
                    }
                }

                return (
                    <div className="flex gap-1.5 items-center justify-end w-full">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                            onClick={() => setRowToEdit(row)}
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            disabled={isInactive}
                            title={isInactive ? "El ciclo está inactivo" : "Editar"}
                        >
                            <TbPencil size={15} />
                        </button>
                        {isInstructor && (
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                onClick={() => handleDelete(row)}
                                disabled={isInactive}
                                title={isInactive ? "El ciclo está inactivo" : "Eliminar"}
                            >
                                <TbTrash size={15} />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    // Tooltip personalizado para gráficos Recharts
    const CustomChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0]?.payload;
            const tituloTooltip = dataPoint?.fullLabel || label || dataPoint?.nombre || payload[0]?.name;
            return (
                <div className="bg-white/95 backdrop-blur-md p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
                    <p className="font-bold text-gray-800">{tituloTooltip}</p>
                    <p className="text-pink-600 font-extrabold mt-1 text-sm flex items-center gap-1.5">
                        <TbHeart className="text-pink-500" />
                        <span>{payload[0].value} {payload[0].value === 1 ? "monta" : "montas"}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const cicloAsociado = useMemo(() => {
        if (!filtroDesdeCiclo) return null;
        return ciclos.find((c) => String(c.Id_Ciclo) === String(filtroDesdeCiclo.Id_Ciclo)) || filtroDesdeCiclo;
    }, [filtroDesdeCiclo, ciclos]);

    const estadoCicloActual = useMemo(() => {
        if (!cicloAsociado) return "";
        const est = (cicloAsociado.Estado || filtroDesdeCiclo?.Estado || "").trim();
        if (est) return est;
        const act = (cicloAsociado.Activo || cicloAsociado.activo || filtroDesdeCiclo?.Activo || "").toUpperCase();
        return act === "N" ? "Inactivo" : "Activo";
    }, [cicloAsociado, filtroDesdeCiclo]);

    const esCicloNoPermitido = useMemo(() => {
        if (!cicloAsociado) return false;
        const estLower = estadoCicloActual.toLowerCase();
        return (
            estLower === "finalizado" ||
            estLower === "fallido" ||
            estLower === "realizado" ||
            estLower === "inactivo" ||
            (filtroDesdeCiclo && (filtroDesdeCiclo.Activo || "").toUpperCase() === "N")
        );
    }, [cicloAsociado, estadoCicloActual, filtroDesdeCiclo]);

    // Si viene desde un ciclo específico, mostrar ÚNICAMENTE los registros detallados de ese ciclo
    if (filtroDesdeCiclo) {
        return (
            <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-5">
                {/* Cabecera del ciclo específico */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/ciclos")}
                            className="w-11 h-11 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-all border border-gray-200 shadow-sm shrink-0"
                            title="Volver a Ciclos"
                        >
                            <TbArrowLeft size={22} />
                        </button>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold mb-1">
                                <span>🐷 Ciclo Reproductivo #{filtroDesdeCiclo.Id_Ciclo}</span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Montas de {filtroDesdeCiclo.Nom_Porcino || `Cerda #${filtroDesdeCiclo.Id_Porcino}`}
                            </h2>
                            <p className="text-xs text-gray-500 m-0">
                                Mostrando únicamente los registros detallados de monta natural asociados a este ciclo.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {!esCicloNoPermitido ? (
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-2xl shadow-md shadow-pink-500/20 hover:from-pink-600 hover:to-rose-700 transition-all text-sm cursor-pointer"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                                onClick={() => setRowToEdit({})}
                            >
                                <TbPlus size={18} />
                                <span>Nueva Monta</span>
                            </button>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-600 border border-gray-200 text-xs rounded-xl font-bold">
                                <span>🔒</span> Ciclo {estadoCicloActual || "Cerrado"} (No permite registros)
                            </span>
                        )}
                    </div>
                </div>

                {/* Tabla de registros detallados del ciclo */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h5 className="font-bold text-gray-900 m-0">Detalle de Servicios de Monta</h5>
                            <p className="text-xs text-gray-500 m-0">
                                Total montas en este ciclo: {listMontasParaTabla.length}
                            </p>
                        </div>

                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none z-10" />
                            <input
                                type="text"
                                className="form-control form-control-sm search-input-with-icon rounded-2xl text-xs py-2.5 shadow-sm focus:border-pink-500"
                                placeholder="Buscar en este ciclo..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={listMontasParaTabla}
                        keyField="Id_Monta"
                        pagination
                        paginationPerPage={10}
                        highlightOnHover
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="py-12 text-center text-gray-400 text-xs">
                                No hay montas registradas para este ciclo reproductivo.
                            </div>
                        }
                    />
                </div>

                {/* Modal de Detalle de Responsables */}
                {renderModalResponsables()}

                {/* Modal de Registro / Edición de Monta */}
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-3xl border-0 shadow-2xl overflow-hidden">
                            <div className="modal-header bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 py-3.5 px-5">
                                <div className="flex items-center gap-2">
                                    <TbHeart className="text-xl" />
                                    <h1 className="modal-title fs-6 font-bold m-0">
                                        {rowToEdit.Id_Monta ? `Editar Monta #${rowToEdit.Id_Monta}` : "Nueva Monta Natural"}
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
                                <MontaForm
                                    hideModal={hideModal}
                                    rowToEdit={rowToEdit}
                                    refreshTable={getAllMontas}
                                    preloaded={filtroDesdeCiclo || {}}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

            {/* Cabecera Principal */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                        <TbHeart className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Panel de Montas
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Supervisa la actividad de las montas, la frecuencia de servicios por cerda y las montas por machos.
                            Los detalles auditables se consolidan directamente con los ciclos reproductivos.
                        </p>
                    </div>
                </div>
            </div>
            {/* Tarjetas de Indicadores (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Total Montas */}
                <div className="bg-gradient-to-br from-pink-50/80 via-white to-pink-50/30 border border-pink-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                            Total Montas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-sm">
                            <TbHeart size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.totalMontas}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Servicios registrados en el periodo seleccionado
                        </p>
                    </div>
                </div>

                {/* KPI 2: Cerdas Participantes */}
                <div className="bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 border border-purple-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                            Cerdas Servidas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
                            <TbPig size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.cerdasParticipantes}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Hembras únicas que recibieron monta
                        </p>
                    </div>
                </div>

                {/* KPI 3: Verracos Utilizados */}
                <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 border border-blue-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Verracos Involucrados
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            <TbGenderMale size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.machosUtilizados}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Reproductores machos empleados
                        </p>
                    </div>
                </div>

                {/* KPI 4: Promedio por Ciclo */}
                <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                            Promedio / Ciclo
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <TbRefresh size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {kpis.promedioPorCiclo}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">montas/ciclo</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Base: <strong>{kpis.ciclosConMonta}</strong> ciclo(s) con actividad
                        </p>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros Estadísticos y Rango */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <TbFilter className="text-pink-500 text-lg" />
                        <h6 className="font-bold text-gray-800 m-0 text-sm">Filtros Estadísticos de Análisis</h6>
                    </div>
                    {hayFiltrosActivos && (
                        <button
                            onClick={limpiarFiltros}
                            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                            <TbX size={14} />
                            <span>Limpiar filtros</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {/* Periodo */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Periodo de Tiempo
                        </label>
                        <select
                            className="form-select form-select-sm rounded-xl text-xs"
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                        >
                            <option value="all">Todo el historial</option>
                            <option value="30d">Últimos 30 días</option>
                            <option value="90d">Últimos 90 días</option>
                            <option value="year">Año en curso ({new Date().getFullYear()})</option>
                            <option value="custom">Rango personalizado</option>
                        </select>
                    </div>

                    {/* Verraco (Macho) */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Verraco (Macho)
                        </label>
                        <select
                            className="form-select form-select-sm rounded-xl text-xs"
                            value={filtroMacho}
                            onChange={(e) => setFiltroMacho(e.target.value)}
                        >
                            <option value="all">Todos los machos</option>
                            {machosDisponibles.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cerda (Hembra) */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Cerda (Hembra)
                        </label>
                        <select
                            className="form-select form-select-sm rounded-xl text-xs"
                            value={filtroCerda}
                            onChange={(e) => setFiltroCerda(e.target.value)}
                        >
                            <option value="all">Todas las hembras</option>
                            {cerdasDisponibles.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Estado del Ciclo */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Estado del Ciclo Reproductivo
                        </label>
                        <select
                            className="form-select form-select-sm rounded-xl text-xs"
                            value={filtroEstadoCiclo}
                            onChange={(e) => setFiltroEstadoCiclo(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="Activo">Ciclos Activos</option>
                            <option value="Fallido">Ciclos Fallidos</option>
                            <option value="Finalizado">Ciclos Finalizados</option>
                        </select>
                    </div>

                    {/* Rango personalizado: Fechas */}
                    {filtroPeriodo === "custom" && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Desde:</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm rounded-xl text-xs"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Hasta:</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm rounded-xl text-xs"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección de Gráficas Estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfica 1: Evolución Temporal Dinámica */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h6 className="font-bold text-gray-900 m-0 text-base">{graficaEvolucion.titulo}</h6>
                                <p className="text-xs text-gray-500 m-0">{graficaEvolucion.subtitulo}</p>
                            </div>
                            <span className="p-2 rounded-xl bg-pink-50 text-pink-600">
                                <TbChartBar size={20} />
                            </span>
                        </div>

                        {graficaEvolucion.datos.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <TbInfoCircle size={32} />
                                <span className="text-xs">No hay datos de montas en el periodo seleccionado</span>
                            </div>
                        ) : (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={graficaEvolucion.datos}
                                        margin={{ top: 10, right: 10, left: -20, bottom: graficaEvolucion.datos.length > 6 ? 20 : 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 9.5, fill: "#64748b" }}
                                            interval={0}
                                            angle={graficaEvolucion.datos.length > 6 ? -35 : 0}
                                            textAnchor={graficaEvolucion.datos.length > 6 ? "end" : "middle"}
                                            height={graficaEvolucion.datos.length > 6 ? 48 : 28}
                                        />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                                        <RechartsTooltip content={<CustomChartTooltip />} />
                                        <Bar dataKey="cantidad" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                            {graficaEvolucion.datos.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#ec4899" : "#f43f5e"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>Periodos evaluados: {graficaEvolucion.datos.length}</span>
                        <span>{kpis.totalMontas} eventos registrados</span>
                    </div>
                </div>

                {/* Gráfica 2: Participación de Verracos */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h6 className="font-bold text-gray-900 m-0 text-base">Uso de Reproductores (Verracos)</h6>
                                <p className="text-xs text-gray-500 m-0">Distribución de servicios por reproductor macho</p>
                            </div>
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <TbGenderMale size={20} />
                            </span>
                        </div>

                        {dataGraficaMachos.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <TbInfoCircle size={32} />
                                <span className="text-xs">No hay datos de reproductores en el filtro actual</span>
                            </div>
                        ) : (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={dataGraficaMachos}
                                        margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                                        <YAxis
                                            dataKey="nombre"
                                            type="category"
                                            width={110}
                                            tick={{ fontSize: 10, fill: "#334155" }}
                                        />
                                        <RechartsTooltip content={<CustomChartTooltip />} />
                                        <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={25} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>Machos representados: {dataGraficaMachos.length}</span>
                        <span>Control de carga de reproductores</span>
                    </div>
                </div>
            </div>

            {/* Tabla Detallada de Montas */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h5 className="font-bold text-gray-900 m-0">Registros de Montas Detallados</h5>
                        <p className="text-xs text-gray-500 m-0">
                            Mostrando {listMontasParaTabla.length} de {montas.length} montas registradas
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none z-10" />
                        <input
                            type="text"
                            className="form-control form-control-sm search-input-with-icon rounded-2xl text-xs py-2.5 shadow-sm focus:border-pink-500"
                            placeholder="Buscar por cerda, macho, fecha u observaciones..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columnsTable}
                    data={listMontasParaTabla}
                    keyField="Id_Monta"
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    highlightOnHover
                    customStyles={customTableStyles}
                    noDataComponent={
                        <div className="py-12 text-center text-gray-400 text-xs">
                            No se encontraron montas que coincidan con los criterios.
                        </div>
                    }
                />
            </div>

            {/* Modal de Detalle de Responsables */}
            {renderModalResponsables()}

            {/* Modal de Registro / Edición de Monta */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-3xl border-0 shadow-2xl overflow-hidden">
                        <div className="modal-header bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 py-3.5 px-5">
                            <div className="flex items-center gap-2">
                                <TbHeart className="text-xl" />
                                <h1 className="modal-title fs-6 font-bold m-0">
                                    {rowToEdit.Id_Monta ? `Editar Monta #${rowToEdit.Id_Monta}` : "Nueva Monta Natural"}
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
                            <MontaForm
                                hideModal={hideModal}
                                rowToEdit={rowToEdit}
                                refreshTable={getAllMontas}
                                preloaded={filtroDesdeCiclo || {}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudMonta;