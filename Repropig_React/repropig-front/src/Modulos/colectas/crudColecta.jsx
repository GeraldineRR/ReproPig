import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import ColectaForm from "./colectaForm.jsx";
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
    Tooltip as RechartsTooltip
} from "recharts";
import {
    TbFlask,
    TbGenderMale,
    TbAlertTriangle,
    TbCheck,
    TbBan,
    TbFilter,
    TbSearch,
    TbPlus,
    TbX,
    TbInfoCircle,
    TbPencil,
    TbTrash,
    TbChartBar,
    TbLayersLinked
} from "react-icons/tb";
import { formatearFecha, getDiasParaVencer, getEstadoVigenciaColecta } from "../../utils/dateUtils.js";
import { agruparDatosEvolucion } from "../../utils/chartGroupingUtils.js";
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

    // Filtros de inventario y estadísticas
    const [filtroPeriodo, setFiltroPeriodo] = useState("all");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filtroStock, setFiltroStock] = useState("all"); // 'all' | 'disponible' | 'vencida'
    const [filtroMacho, setFiltroMacho] = useState("all");

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

    // Donantes únicos para el selector
    const machosDisponibles = useMemo(() => {
        const map = new Map();
        colectas.forEach((c) => {
            if (c.Id_Porcino) {
                const nombre = c.porcino?.Nom_Porcino
                    ? `${c.porcino.Nom_Porcino} ${c.porcino.Num_Chapeta ? `(#${c.porcino.Num_Chapeta})` : ""}`
                    : `Macho #${c.Id_Porcino}`;
                map.set(c.Id_Porcino, nombre);
            }
        });
        return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [colectas]);

    // Colectas filtradas reactivamente
    const colectasFiltradas = useMemo(() => {
        let base = filtroDesdeInseminacion
            ? colectas.filter((c) => String(c.Id_colecta) === String(filtroDesdeInseminacion.Id_colecta))
            : colectas;

        const ahora = new Date();

        return base.filter((item) => {
            // 1. Periodo
            if (item.Fecha) {
                const parteF = String(item.Fecha).split("T")[0].split(" ")[0];
                const [y, m, d] = parteF.split("-").map(Number);
                const f = new Date(y, m - 1, d);

                if (filtroPeriodo === "30d") {
                    const lim = new Date();
                    lim.setDate(ahora.getDate() - 30);
                    lim.setHours(0, 0, 0, 0);
                    if (f < lim) return false;
                } else if (filtroPeriodo === "90d") {
                    const lim = new Date();
                    lim.setDate(ahora.getDate() - 90);
                    lim.setHours(0, 0, 0, 0);
                    if (f < lim) return false;
                } else if (filtroPeriodo === "year") {
                    if (f.getFullYear() !== ahora.getFullYear()) return false;
                } else if (filtroPeriodo === "custom") {
                    if (fechaDesde && parteF < fechaDesde) return false;
                    if (fechaHasta && parteF > fechaHasta) return false;
                }
            }

            // 2. Macho Donante
            if (filtroMacho !== "all" && String(item.Id_Porcino) !== String(filtroMacho)) {
                return false;
            }

            // 3. Estado de Stock / Vigencia
            const disponibles = (Number(item.cant_generada) || 0) - (Number(item.cant_utilizada) || 0);
            const vigencia = getEstadoVigenciaColecta(item);

            if (filtroStock === "disponible") {
                if (disponibles <= 0 || vigencia.isVencida) return false;
            } else if (filtroStock === "vencida") {
                if (!vigencia.isVencida) return false;
            }

            return true;
        });
    }, [colectas, filtroDesdeInseminacion, filtroPeriodo, fechaDesde, fechaHasta, filtroMacho, filtroStock]);

    // KPIs calculados
    const kpis = useMemo(() => {
        let gen = 0;
        let uti = 0;
        let dispVigente = 0;
        let vencidasPajillas = 0;
        let colectasVencidas = 0;

        colectasFiltradas.forEach((c) => {
            const g = Number(c.cant_generada) || 0;
            const u = Number(c.cant_utilizada) || 0;
            const d = Math.max(0, g - u);
            gen += g;
            uti += u;

            const vigencia = getEstadoVigenciaColecta(c);
            if (vigencia.isVencida) {
                // Si la colecta está vencida, aunque tenga saldo, NO es disponible: es stock vencido/inactivo
                vencidasPajillas += d;
                colectasVencidas += 1;
            } else {
                dispVigente += d;
            }
        });

        const porcentajeUso = gen > 0 ? ((uti / gen) * 100).toFixed(1) : "0.0";

        return {
            totalColectas: colectasFiltradas.length,
            pajillasGeneradas: gen,
            pajillasUtilizadas: uti,
            pajillasDisponibles: dispVigente,
            pajillasVencidas: vencidasPajillas,
            colectasVencidas,
            tasaUso: porcentajeUso
        };
    }, [colectasFiltradas]);

    // Gráfica de Evolución Temporal Dinámica de Colectas
    const graficaEvolucion = useMemo(() => {
        const res = agruparDatosEvolucion({
            items: colectasFiltradas,
            campoFecha: "Fecha",
            configPeriodo: { filtroPeriodo, fechaDesde, fechaHasta },
            entidad: "colectas",
            camposSuma: [{ campo: "cant_generada", destino: "pajillas" }]
        });
        res.datos.forEach((d) => {
            d.colectas = d.cantidad;
        });
        return res;
    }, [colectasFiltradas, filtroPeriodo, fechaDesde, fechaHasta]);

    // Helper para obtener dosis disponibles de una colecta
    const getDosisDisponibles = (c) => {
        const g = Number(c.cant_generada) || 0;
        const u = Number(c.cant_utilizada) || 0;
        return Math.max(0, g - u);
    };

    // Colectas próximas a vencer (≤ 24h restantes de vida útil, vigentes y con saldo > 0)
    const colectasProximasAVencer = useMemo(() => {
        return colectas.filter((c) => {
            const disp = getDosisDisponibles(c);
            if (disp <= 0) return false;
            const vig = getEstadoVigenciaColecta(c);
            return vig.estado === "Vence pronto" || (vig.diasVence !== null && vig.diasVence <= 1 && !vig.isVencida);
        });
    }, [colectas]);

    const limpiarFiltros = () => {
        setFiltroPeriodo("all");
        setFechaDesde("");
        setFechaHasta("");
        setFiltroStock("all");
        setFiltroMacho("all");
        setFilterText("");
    };

    const hayFiltrosActivos =
        filtroPeriodo !== "all" ||
        filtroStock !== "all" ||
        filtroMacho !== "all" ||
        fechaDesde !== "" ||
        fechaHasta !== "";

    // Filtro DataTable
    const listColectasParaTabla = useMemo(() => {
        if (!filterText.trim()) return colectasFiltradas;
        const text = filterText.toLowerCase().trim();
        return colectasFiltradas.filter((item) => {
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
    }, [colectasFiltradas, filterText, responsables]);

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

    const CustomChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0]?.payload;
            const tituloTooltip = dataPoint?.fullLabel || label || dataPoint?.nombre || payload[0]?.name;
            return (
                <div className="bg-white/95 backdrop-blur-md p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
                    <p className="font-bold text-gray-800">{tituloTooltip}</p>
                    {payload.map((entry, idx) => (
                        <p key={idx} className="font-bold mt-1 text-xs flex items-center gap-1.5" style={{ color: entry.color || entry.fill }}>
                            <span>{entry.name}:</span>
                            <span className="font-extrabold">{entry.value} {entry.name === "Colectas" ? "colecta(s)" : "dosis"}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

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

            {/* Tarjetas de Indicadores (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Pajillas Generadas */}
                <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 border border-blue-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Dosis Generadas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                            <TbFlask size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.pajillasGeneradas}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Pajillas producidas en {kpis.totalColectas} colectas
                        </p>
                    </div>
                </div>

                {/* KPI 2: Pajillas Utilizadas */}
                <div className="bg-gradient-to-br from-teal-50/80 via-white to-teal-50/30 border border-teal-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                            Dosis Utilizadas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-sm">
                            <TbCheck size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {kpis.pajillasUtilizadas}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">({kpis.tasaUso}% del total)</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Consumidas en inseminaciones artificiales
                        </p>
                    </div>
                </div>

                {/* KPI 3: Saldo Disponible */}
                <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                            Existencia Disponible para utilización
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <TbLayersLinked size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.pajillasDisponibles}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Pajillas aptas para uso inmediato
                        </p>
                    </div>
                </div>

                {/* KPI 4: Dosis Vencidas */}
                <div className="bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 border border-rose-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                            Dosis Vencidas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                            <TbAlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.pajillasVencidas}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            {kpis.colectasVencidas} colecta(s) vencida(s) no aptas para uso
                        </p>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros de Inventario */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <TbFilter className="text-blue-500 text-lg" />
                        <h6 className="font-bold text-gray-800 m-0 text-sm">Filtros de Control de Inventario</h6>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Periodo */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Periodo de Colecta
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

                    {/* Stock y Vigencia (Sin agotadas ni próximas a vencer) */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Estado del Stock
                        </label>
                        <select
                            className="form-select form-select-sm rounded-xl text-xs"
                            value={filtroStock}
                            onChange={(e) => setFiltroStock(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="disponible">Solo disponibles (Vigentes)</option>
                            <option value="vencida">Vencidas (Inactivas)</option>
                        </select>
                    </div>

                    {/* Donante (Macho) */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Macho Donante
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

                    {/* Rango Personalizado */}
                    {filtroPeriodo === "custom" && (
                        <div className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
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

            {/* Sección: Evolución Temporal y Colectas Próximas a Vencer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfica: Evolución Temporal Dinámica de Colectas */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h6 className="font-bold text-gray-900 m-0 text-base">{graficaEvolucion.titulo}</h6>
                                <p className="text-xs text-gray-500 m-0">{graficaEvolucion.subtitulo}</p>
                            </div>
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <TbChartBar size={20} />
                            </span>
                        </div>

                        {graficaEvolucion.datos.length === 0 ? (
                            <div className="h-60 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <TbInfoCircle size={32} />
                                <span className="text-xs">No hay datos en el periodo seleccionado</span>
                            </div>
                        ) : (
                            <div className="h-60 w-full">
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
                                        <Bar dataKey="colectas" name="Colectas" fill="#0284c7" radius={[5, 5, 0, 0]} maxBarSize={30} />
                                        <Bar dataKey="pajillas" name="Dosis Producidas" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex justify-between">
                        <span>Periodos evaluados: {graficaEvolucion.datos.length}</span>
                        <span>{kpis.totalColectas} colectas / {kpis.pajillasGeneradas} dosis producidas</span>
                    </div>
                </div>

                {/* Tabla Pequeña: Colectas Próximas a Vencer */}
                <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs">
                                    <TbAlertTriangle size={20} />
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-900 m-0 text-base">Próximas a Vencer</h6>
                                    <p className="text-xs text-gray-500 m-0">Requieren uso prioritario (≤ 24h)</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                {colectasProximasAVencer.length} dosis
                            </span>
                        </div>

                        {colectasProximasAVencer.length === 0 ? (
                            <div className="h-60 flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <TbCheck size={24} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Sin alertas de vencimiento</span>
                                <span className="text-[11px] text-gray-400 max-w-xs">
                                    Todas las colectas vigentes en inventario disponen de tiempo de vida útil óptimo.
                                </span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/60">
                                            <th className="py-2.5 px-3 rounded-l-xl">ID Colecta</th>
                                            <th className="py-2.5 px-3">Fecha Colecta</th>
                                            <th className="py-2.5 px-3">Donante</th>
                                            <th className="py-2.5 px-3 text-right rounded-r-xl">Disponibles</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {colectasProximasAVencer.map((c) => {
                                            const disp = getDosisDisponibles(c);
                                            const donanteNombre = c.porcino?.Nom_Porcino
                                                ? `${c.porcino.Nom_Porcino} ${c.porcino.Num_Chapeta ? `(#${c.porcino.Num_Chapeta})` : ""}`
                                                : (c.Id_Porcino ? `Macho #${c.Id_Porcino}` : "Externo");
                                            return (
                                                <tr key={c.Id_colecta} className="hover:bg-amber-50/40 transition-colors">
                                                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                                            #{c.Id_colecta}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-medium text-gray-700 whitespace-nowrap">
                                                        {formatearFecha(c.Fecha)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-gray-600 truncate max-w-[130px]" title={donanteNombre}>
                                                        {donanteNombre}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                            {disp} dosis
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>Semen fresco refrigerado (vida útil: 3 días)</span>
                        <span className="text-amber-600 font-semibold">Priorizar en inseminaciones</span>
                    </div>
                </div>
            </div>

            {/* Tabla Detallada de Colectas */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h5 className="font-bold text-gray-900 m-0">Registros de Colectas Detallados</h5>
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