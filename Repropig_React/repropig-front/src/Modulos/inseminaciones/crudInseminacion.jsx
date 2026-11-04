import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import InseminacionForm from "./inseminacionForm.jsx";
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
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    TbVaccine,
    TbPig,
    TbFlask,
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
    TbLayersLinked,
    TbArrowLeft,
    TbUsers
} from "react-icons/tb";
import { formatearFecha, formatearHora } from "../../utils/dateUtils.js";
import { agruparDatosEvolucion } from "../../utils/chartGroupingUtils.js";

const CrudInseminacion = () => {
    const { usuario } = useAuth();
    const isInstructor = (usuario?.Cargo || usuario?.cargo || usuario?.Rol || usuario?.rol || "").toLowerCase().includes("instructor");

    const MySwal = WithReactContent(Swal);
    const navigate = useNavigate();
    const location = useLocation();
    const filtroDesdeCiclo = location.state && location.state.Id_Ciclo ? location.state : null;

    const [inseminaciones, setInseminaciones] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [colectas, setColectas] = useState([]);
    const [ciclos, setCiclos] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [rowToEdit, setRowToEdit] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [modalResponsablesData, setModalResponsablesData] = useState(null);

    // Filtros de estadísticas
    const [filtroPeriodo, setFiltroPeriodo] = useState("all");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filtroCerda, setFiltroCerda] = useState("all");
    const [filtroColecta, setFiltroColecta] = useState("all");
    const [filtroEstadoCiclo, setFiltroEstadoCiclo] = useState("all");
    const [mostrarTodasCerdas, setMostrarTodasCerdas] = useState(false);

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
        const { inseminacion, responsables: lista } = modalResponsablesData;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-scaleUp">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                                <TbUsers className="text-xl text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm m-0 leading-tight">Responsables Asignados</h4>
                                <p className="text-[11px] text-teal-100 m-0">
                                    {inseminacion?.Fec_hora
                                        ? `${formatearFecha(inseminacion.Fec_hora)} ${formatearHora(inseminacion.Fec_hora)}`
                                        : "Procedimiento de Inseminación"}
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
                            <p className="text-xs text-gray-500 text-center py-4">No hay responsables asociados a esta inseminación.</p>
                        ) : (
                            lista.map((resp, idx) => (
                                <div
                                    key={resp.Id_Responsable || idx}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-teal-50/40 border border-gray-100 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
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
            title: `¿Deseas ${accion} esta inseminación?`,
            text: `La inseminación #${row.Id_Inseminacion} pasará a estar ${esActivo ? "Inactiva" : "Activa"}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: esActivo ? "#d33" : "#198754",
            cancelButtonColor: "#6c757d",
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/inseminacion/${row.Id_Inseminacion}/toggle-estado`);
                MySwal.fire({ icon: "success", title: "Estado actualizado", timer: 1500, showConfirmButton: false });
                getAllInseminaciones();
            } catch {
                try {
                    const nuevoEstado = esActivo ? "Inactivo" : "Activo";
                    await apiAxios.put(`/inseminacion/${row.Id_Inseminacion}`, { ...row, Estado: nuevoEstado });
                    MySwal.fire({ icon: "success", title: "Estado actualizado", timer: 1500, showConfirmButton: false });
                    getAllInseminaciones();
                } catch {
                    MySwal.fire({ icon: "error", title: "Error", text: "No se pudo cambiar el estado." });
                }
            }
        }
    };

    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: "¿Estás seguro?",
            text: `Se eliminará la inseminación #${row.Id_Inseminacion} permanentemente y se repondrán las dosis a la colecta correspondiente.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });
        if (result.isConfirmed) {
            try {
                await apiAxios.delete("/inseminacion/" + row.Id_Inseminacion);
                MySwal.fire({ icon: "success", title: "Eliminado", text: "Inseminación eliminada correctamente" });
                getAllInseminaciones();
                getColectas();
            } catch (error) {
                MySwal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
            }
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            await Promise.all([getAllInseminaciones(), getResponsables(), getColectas(), getCiclos()]);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    const getAllInseminaciones = async () => {
        try {
            const response = await apiAxios.get("/inseminacion/");
            const sortedData = (response.data || []).sort(
                (a, b) => new Date(b.Fec_hora || 0) - new Date(a.Fec_hora || 0)
            );
            setInseminaciones(sortedData);
        } catch (error) {
            console.error("Error al obtener inseminaciones:", error);
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

    const getColectas = async () => {
        try {
            const response = await apiAxios.get("/colectas/");
            setColectas(response.data || []);
        } catch (error) {
            console.error("Error al obtener colectas:", error);
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

    // Opciones para filtros dinámicos
    const cerdasDisponibles = useMemo(() => {
        const map = new Map();
        inseminaciones.forEach((ins) => {
            if (ins.Id_Porcino) {
                const nombre = ins.porcino?.Nom_Porcino
                    ? `${ins.porcino.Nom_Porcino} ${ins.porcino.Num_Chapeta ? `(#${ins.porcino.Num_Chapeta})` : ""}`
                    : `Cerda #${ins.Id_Porcino}`;
                map.set(ins.Id_Porcino, nombre);
            }
        });
        return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [inseminaciones]);

    // Helper para verificar periodo
    const cumplePeriodo = (fechaHora, periodo, desde, hasta) => {
        if (!fechaHora) return true;
        const ahora = new Date();
        const f = new Date(fechaHora);
        if (periodo === "30d") {
            const lim = new Date();
            lim.setDate(ahora.getDate() - 30);
            if (f < lim) return false;
        } else if (periodo === "90d") {
            const lim = new Date();
            lim.setDate(ahora.getDate() - 90);
            if (f < lim) return false;
        } else if (periodo === "year") {
            if (f.getFullYear() !== ahora.getFullYear()) return false;
        } else if (periodo === "custom") {
            const fechaStr = fechaHora.split("T")[0];
            if (desde && new Date(fechaStr) < new Date(desde)) return false;
            if (hasta && new Date(fechaStr) > new Date(hasta)) return false;
        }
        return true;
    };

    // 1. Inseminaciones que pertenecen al periodo de tiempo seleccionado
    const inseminacionesPorPeriodo = useMemo(() => {
        let base = filtroDesdeCiclo
            ? inseminaciones.filter((i) => String(i.Id_Ciclo) === String(filtroDesdeCiclo.Id_Ciclo))
            : inseminaciones;

        return base.filter((item) => cumplePeriodo(item.Fec_hora, filtroPeriodo, fechaDesde, fechaHasta));
    }, [inseminaciones, filtroDesdeCiclo, filtroPeriodo, fechaDesde, fechaHasta]);

    // 2. Colectas vinculadas a las inseminaciones de ese periodo (evita saturar el dropdown)
    const colectasDisponibles = useMemo(() => {
        const map = new Map();
        inseminacionesPorPeriodo.forEach((ins) => {
            if (ins.Id_colecta) {
                const colObj = ins.colecta || colectas.find((c) => c.Id_colecta === ins.Id_colecta);
                const nombreDonante = colObj?.porcino?.Nom_Porcino
                    ? `${colObj.porcino.Nom_Porcino} ${colObj.porcino.Num_Chapeta ? `(#${colObj.porcino.Num_Chapeta})` : ""}`
                    : colObj?.Id_Porcino
                        ? `Macho #${colObj.Id_Porcino}`
                        : "—";
                const label = `Colecta #${ins.Id_colecta} (${nombreDonante})`;
                map.set(ins.Id_colecta, label);
            }
        });
        return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [inseminacionesPorPeriodo, colectas]);

    // Si la colecta seleccionada ya no existe en el periodo seleccionado, resetear a 'all'
    useEffect(() => {
        if (filtroColecta !== "all") {
            const existe = colectasDisponibles.some((c) => String(c.id) === String(filtroColecta));
            if (!existe) {
                setFiltroColecta("all");
            }
        }
    }, [colectasDisponibles, filtroColecta]);

    // Filtrado principal reactivo (sobre inseminaciones del periodo)
    const inseminacionesFiltradas = useMemo(() => {
        return inseminacionesPorPeriodo.filter((item) => {
            // Cerda
            if (filtroCerda !== "all" && String(item.Id_Porcino) !== String(filtroCerda)) {
                return false;
            }

            // Colecta
            if (filtroColecta !== "all" && String(item.Id_colecta) !== String(filtroColecta)) {
                return false;
            }

            // Estado del Ciclo (Activo, Fallido, Finalizado) - Idéntico a Monta
            if (filtroEstadoCiclo !== "all") {
                const cicloAsoc = item.ciclo || ciclos.find((c) => String(c.Id_Ciclo) === String(item.Id_Ciclo));
                let estadoCiclo = (cicloAsoc?.Estado || "").trim().toLowerCase();
                if (!estadoCiclo) {
                    const act = (cicloAsoc?.Activo || cicloAsoc?.activo || "").toUpperCase();
                    estadoCiclo = act === "N" ? "fallido" : "activo";
                }
                if (estadoCiclo !== filtroEstadoCiclo.toLowerCase()) return false;
            }

            return true;
        });
    }, [inseminacionesPorPeriodo, filtroCerda, filtroColecta, filtroEstadoCiclo, ciclos]);

    // KPIs calculados
    const kpis = useMemo(() => {
        const totalProcedimientos = inseminacionesFiltradas.length;
        const cerdasSet = new Set(inseminacionesFiltradas.map((i) => i.Id_Porcino).filter(Boolean));
        const ciclosSet = new Set(inseminacionesFiltradas.map((i) => i.Id_Ciclo).filter(Boolean));

        const totalPajillas = inseminacionesFiltradas.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
        const promInsemPorCiclo = ciclosSet.size > 0 ? (totalProcedimientos / ciclosSet.size).toFixed(1) : "0.0";

        return {
            totalProcedimientos,
            cerdasInseminadas: cerdasSet.size,
            ciclosInvolucrados: ciclosSet.size,
            promedioPorCiclo: promInsemPorCiclo,
            pajillasUtilizadas: totalPajillas
        };
    }, [inseminacionesFiltradas]);

    // Gráfica 1: Evolución Temporal Dinámica (Procedimientos y Pajillas)
    const graficaEvolucion = useMemo(() => {
        const res = agruparDatosEvolucion({
            items: inseminacionesFiltradas,
            campoFecha: "Fec_hora",
            configPeriodo: { filtroPeriodo, fechaDesde, fechaHasta },
            entidad: "inseminaciones",
            camposSuma: [{ campo: "cantidad", destino: "pajillas" }]
        });
        // Garantizar campo procedimientos sincronizado con cantidad
        res.datos.forEach((d) => {
            d.procedimientos = d.cantidad;
        });
        return res;
    }, [inseminacionesFiltradas, filtroPeriodo, fechaDesde, fechaHasta]);

    const COLORES_CERDAS = [
        "#9333ea", // Púrpura principal
        "#ec4899", // Rosa
        "#06b6d4", // Cian
        "#f59e0b", // Ámbar
        "#10b981", // Esmeralda
        "#3b82f6", // Azul
        "#8b5cf6", // Violeta
        "#f43f5e", // Rosa fuerte
        "#14b8a6", // Teal
        "#6366f1"  // Índigo
    ];

    // Gráfica 2: Cerdas con mayor procedimientos de inseminaciones (Top 5 / Todas)
    const dataGraficaCerdasCompleta = useMemo(() => {
        const conteoPorCerda = {};

        inseminacionesFiltradas.forEach((ins) => {
            const id = ins.Id_Porcino;
            if (!id) return;
            const nombre = ins.porcino?.Nom_Porcino
                ? `${ins.porcino.Nom_Porcino} ${ins.porcino.Num_Chapeta ? `(#${ins.porcino.Num_Chapeta})` : ""}`
                : `Cerda #${id}`;

            if (!conteoPorCerda[id]) {
                conteoPorCerda[id] = { id, nombre, cantidad: 0 };
            }
            conteoPorCerda[id].cantidad += 1;
        });

        return Object.values(conteoPorCerda).sort((a, b) => b.cantidad - a.cantidad);
    }, [inseminacionesFiltradas]);

    const dataGraficaCerdas = useMemo(() => {
        const lista = mostrarTodasCerdas ? dataGraficaCerdasCompleta : dataGraficaCerdasCompleta.slice(0, 5);
        return lista.map((item, idx) => ({
            ...item,
            color: COLORES_CERDAS[idx % COLORES_CERDAS.length]
        }));
    }, [dataGraficaCerdasCompleta, mostrarTodasCerdas]);

    const totalInseminacionesGrafica = useMemo(() => {
        return dataGraficaCerdas.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
    }, [dataGraficaCerdas]);

    const limpiarFiltros = () => {
        setFiltroPeriodo("all");
        setFechaDesde("");
        setFechaHasta("");
        setFiltroCerda("all");
        setFiltroColecta("all");
        setFiltroEstadoCiclo("all");
        setFilterText("");
    };

    const hayFiltrosActivos =
        filtroPeriodo !== "all" ||
        filtroCerda !== "all" ||
        filtroColecta !== "all" ||
        filtroEstadoCiclo !== "all" ||
        fechaDesde !== "" ||
        fechaHasta !== "";

    // Filtro para el buscador del DataTable
    const listInseminacionesParaTabla = useMemo(() => {
        if (!filterText.trim()) return inseminacionesFiltradas;
        const text = filterText.toLowerCase().trim();
        return inseminacionesFiltradas.filter((item) => {
            const fecha = item.Fec_hora?.toString().toLowerCase() || "";
            const porcino = item.porcino?.Nom_Porcino?.toLowerCase() || item.Id_Porcino?.toString() || "";
            const chapetaHembra = item.porcino?.Num_Chapeta?.toString().toLowerCase() || "";
            const colObj = item.colecta || colectas.find((c) => c.Id_colecta === item.Id_colecta);
            const donante = colObj?.porcino?.Nom_Porcino?.toLowerCase() || "";
            const resps = getNombresResponsables(item.Id_Responsable).toLowerCase();
            const obs = item.Observaciones?.toLowerCase() || "";
            const ciclo = item.Id_Ciclo?.toString() || "";
            const colectaId = item.Id_colecta?.toString() || "";

            return (
                fecha.includes(text) ||
                porcino.includes(text) ||
                chapetaHembra.includes(text) ||
                donante.includes(text) ||
                resps.includes(text) ||
                obs.includes(text) ||
                ciclo.includes(text) ||
                colectaId.includes(text)
            );
        });
    }, [inseminacionesFiltradas, filterText, colectas, responsables]);

    // Columnas DataTable
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
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
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
            name: "Dosis / Pajillas",
            selector: (row) => row.cantidad,
            sortable: true,
            width: "120px",
            cell: (row) => (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-800 font-bold rounded-lg text-xs border border-cyan-200">
                    <TbVaccine className="text-cyan-600" />
                    <span>{row.cantidad || 1} dosis</span>
                </span>
            )
        },
        {
            name: "Colecta y Donante",
            minWidth: "200px",
            cell: (row) => {
                if (!row.Id_colecta) return <span className="text-gray-400 text-xs">—</span>;
                const col = row.colecta || colectas.find((c) => c.Id_colecta === row.Id_colecta);
                const donante = col?.porcino?.Nom_Porcino || (col?.Id_Porcino ? `Cerdo #${col.Id_Porcino}` : "Donante N/A");
                const chapeta = col?.porcino?.Num_Chapeta ? ` (#${col.porcino.Num_Chapeta})` : "";
                const tipo = col?.Tipo || "Interno";

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800 text-xs">{donante}{chapeta}</span>
                            <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${tipo.toLowerCase() === "externo"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-emerald-100 text-emerald-700"
                                    }`}
                            >
                                {tipo}
                            </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">
                            Colecta #{row.Id_colecta}
                        </span>
                    </div>
                );
            }
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
                        onClick={() => setModalResponsablesData({ inseminacion: row, responsables: lista })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
                        title="Ver responsables asignados"
                    >
                        <TbUsers className="text-teal-600 group-hover:scale-110 transition-transform text-sm" />
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
            minWidth: "160px"
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
                            data-bs-target="#inseminacionModal"
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

    const CustomChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0]?.payload;
            const tituloTooltip = dataPoint?.fullLabel || label || dataPoint?.nombre || dataPoint?.label || payload[0]?.name;
            return (
                <div className="bg-white/95 backdrop-blur-md p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
                    <p className="font-bold text-gray-800">{tituloTooltip}</p>
                    {payload.map((entry, idx) => (
                        <p key={idx} className="font-bold mt-1 text-xs flex items-center gap-1.5" style={{ color: entry.color || entry.fill }}>
                            <span>{entry.name}:</span>
                            <span className="font-extrabold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload, total }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const val = data.value || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
            return (
                <div className="bg-white/95 backdrop-blur-md p-2.5 border border-gray-100 shadow-xl rounded-xl text-xs">
                    <p className="font-bold text-gray-800">{data.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload?.color || data.payload?.fill }} />
                        <span className="font-semibold text-gray-600">Inseminaciones:</span>
                        <span className="font-extrabold text-gray-900">{val}</span>
                        <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            ({pct}%)
                        </span>
                    </div>
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
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-1.5">
                                <span>💉 Ciclo Reproductivo #{filtroDesdeCiclo.Id_Ciclo}</span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Inseminaciones de {filtroDesdeCiclo.Nom_Porcino || `Cerda #${filtroDesdeCiclo.Id_Porcino}`}
                            </h2>
                            <p className="text-xs text-gray-500 m-0">
                                Mostrando únicamente los registros detallados de inseminación artificial de este ciclo.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {!esCicloNoPermitido ? (
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-md shadow-teal-500/20 hover:from-teal-600 hover:to-emerald-700 transition-all text-sm cursor-pointer"
                                data-bs-toggle="modal"
                                data-bs-target="#inseminacionModal"
                                onClick={() => setRowToEdit({})}
                            >
                                <TbPlus size={18} />
                                <span>Registrar Inseminación</span>
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
                            <h5 className="font-bold text-gray-900 m-0">Detalle de Inseminaciones</h5>
                            <p className="text-xs text-gray-500 m-0">
                                Total procedimientos en este ciclo: {listInseminacionesParaTabla.length}
                            </p>
                        </div>

                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none z-10" />
                            <input
                                type="text"
                                className="form-control form-control-sm search-input-with-icon rounded-2xl text-xs py-2.5 shadow-sm focus:border-teal-500"
                                placeholder="Buscar en este ciclo..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={listInseminacionesParaTabla}
                        keyField="Id_Inseminacion"
                        pagination
                        paginationPerPage={10}
                        highlightOnHover
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="py-12 text-center text-gray-400 text-xs">
                                No hay inseminaciones registradas para este ciclo. Haz clic en "Registrar Inseminación" para agregar una.
                            </div>
                        }
                    />
                </div>

                {/* Modal de Detalle de Responsables */}
                {renderModalResponsables()}

                {/* Modal de Registro / Edición de Inseminación */}
                <div className="modal fade" id="inseminacionModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-3xl border-0 shadow-2xl overflow-hidden">
                            <div className="modal-header bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 py-3.5 px-5">
                                <div className="flex items-center gap-2">
                                    <TbVaccine className="text-xl" />
                                    <h1 className="modal-title fs-6 font-bold m-0">
                                        {rowToEdit.Id_Inseminacion
                                            ? `Editar Inseminación #${rowToEdit.Id_Inseminacion}`
                                            : "Nueva Inseminación Artificial"}
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
                                <InseminacionForm
                                    hideModal={hideModal}
                                    rowToEdit={rowToEdit}
                                    refreshTable={() => {
                                        getAllInseminaciones();
                                        getColectas();
                                    }}
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
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                        <TbVaccine className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Panel de Inseminaciones Artificiales
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Monitorea los procedimientos de inseminación artificial, consumo de dosis seminales y trazabilidad
                            con las colectas de semen y donantes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Indicadores (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* KPI 1: Total Inseminaciones */}
                <div className="bg-gradient-to-br from-teal-50/80 via-white to-teal-50/30 border border-teal-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                            Total Inseminaciones
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-sm">
                            <TbVaccine size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.totalProcedimientos}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Procedimientos registrados en el periodo
                        </p>
                    </div>
                </div>

                {/* KPI 2: Cerdas Inseminadas */}
                <div className="bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 border border-purple-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                            Cerdas Inseminadas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
                            <TbPig size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {kpis.cerdasInseminadas}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Hembras con inseminación artificial
                        </p>
                    </div>
                </div>

                {/* KPI 3: Promedio por Ciclo */}
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
                            <span className="text-xs font-semibold text-gray-500">insem./ciclo</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Base: <strong>{kpis.ciclosInvolucrados}</strong> ciclo(s) con actividad
                        </p>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros Estadísticos */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <TbFilter className="text-teal-500 text-lg" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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

                    {/* Cerda */}
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

                    {/* Colecta / Donante (vinculadas al periodo seleccionado) */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                            Colecta / Donante
                        </label>
                        <select
                            className="form-select form-select-sm rounded-xl text-xs"
                            value={filtroColecta}
                            onChange={(e) => setFiltroColecta(e.target.value)}
                        >
                            <option value="all">Todas las colectas ({colectasDisponibles.length})</option>
                            {colectasDisponibles.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Estado del Ciclo (Igual a Montas: Activo, Fallido, Finalizado) */}
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

                    {/* Rango Personalizado */}
                    {filtroPeriodo === "custom" && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfica 1: Evolución Temporal de Procedimientos y Pajillas */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h6 className="font-bold text-gray-900 m-0 text-base">{graficaEvolucion.titulo}</h6>
                                <p className="text-xs text-gray-500 m-0">{graficaEvolucion.subtitulo}</p>
                            </div>
                            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                                <TbChartBar size={20} />
                            </span>
                        </div>

                        {graficaEvolucion.datos.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <TbInfoCircle size={32} />
                                <span className="text-xs">No hay datos en el periodo seleccionado</span>
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
                                        <Bar dataKey="procedimientos" name="Procedimientos" fill="#0d9488" radius={[5, 5, 0, 0]} maxBarSize={30} />
                                        <Bar dataKey="pajillas" name="Pajillas Dosis" fill="#06b6d4" radius={[5, 5, 0, 0]} maxBarSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>Periodos evaluados: {graficaEvolucion.datos.length}</span>
                        <span>{kpis.totalProcedimientos} procedimientos / {kpis.pajillasUtilizadas} dosis</span>
                    </div>
                </div>

                {/* Gráfica 2: Cerdas con Mayor Procedimientos de Inseminación */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                            <div>
                                <h6 className="font-bold text-gray-900 m-0 text-base">Cerdas Más Inseminadas</h6>
                                <p className="text-xs text-gray-500 m-0">
                                    {dataGraficaCerdasCompleta.length === 0
                                        ? "Sin registros en el periodo"
                                        : mostrarTodasCerdas
                                            ? `Mostrando todas las cerdas (${dataGraficaCerdasCompleta.length})`
                                            : `Top 5 de ${dataGraficaCerdasCompleta.length} hembra(s)`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {dataGraficaCerdasCompleta.length > 5 && (
                                    <button
                                        type="button"
                                        onClick={() => setMostrarTodasCerdas(!mostrarTodasCerdas)}
                                        className={`text-xs px-2.5 py-1 rounded-xl font-semibold border transition-all ${
                                            mostrarTodasCerdas
                                                ? "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                                                : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                        }`}
                                        title={mostrarTodasCerdas ? "Volver a mostrar solo las 5 principales" : "Consultar todas las cerdas registradas"}
                                    >
                                        {mostrarTodasCerdas ? "Ver Top 5" : `Ver todas (${dataGraficaCerdasCompleta.length})`}
                                    </button>
                                )}
                                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                    <TbPig size={20} />
                                </span>
                            </div>
                        </div>

                        {dataGraficaCerdas.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <TbInfoCircle size={32} />
                                <span className="text-xs">No hay datos de cerdas para los filtros seleccionados</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dataGraficaCerdas}
                                                innerRadius={45}
                                                outerRadius={75}
                                                paddingAngle={4}
                                                dataKey="cantidad"
                                                nameKey="nombre"
                                            >
                                                {dataGraficaCerdas.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip content={<CustomPieTooltip total={totalInseminacionesGrafica} />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Leyenda interactiva con porcentajes y nombres */}
                                <div className="w-full mt-2 max-h-36 overflow-y-auto px-1 space-y-1.5">
                                    {dataGraficaCerdas.map((item, idx) => {
                                        const porcentaje = totalInseminacionesGrafica > 0
                                            ? ((item.cantidad / totalInseminacionesGrafica) * 100).toFixed(1)
                                            : "0";
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 truncate pr-2">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="font-semibold text-gray-700 truncate" title={item.nombre}>
                                                        {item.nombre}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="font-bold text-gray-900">{item.cantidad} insem.</span>
                                                    <span className="text-[10px] text-purple-700 font-bold bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md">
                                                        {porcentaje}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>Cerdas representadas: {dataGraficaCerdas.length}</span>
                        <span>Frecuencia de servicios reproductivos</span>
                    </div>
                </div>
            </div>

            {/* Tabla Detallada de Inseminaciones */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h5 className="font-bold text-gray-900 m-0">Registros de Inseminaciones Detallados</h5>
                        <p className="text-xs text-gray-500 m-0">
                            Mostrando {listInseminacionesParaTabla.length} de {inseminaciones.length} procedimientos registrados
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none z-10" />
                        <input
                            type="text"
                            className="form-control form-control-sm search-input-with-icon rounded-2xl text-xs py-2.5 shadow-sm focus:border-teal-500"
                            placeholder="Buscar por cerda, colecta, fecha u observaciones..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columnsTable}
                    data={listInseminacionesParaTabla}
                    keyField="Id_Inseminacion"
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    highlightOnHover
                    customStyles={customTableStyles}
                    noDataComponent={
                        <div className="py-12 text-center text-gray-400 text-xs">
                            No se encontraron inseminaciones que coincidan con los filtros aplicados.
                        </div>
                    }
                />
            </div>

            {/* Modal de Detalle de Responsables */}
            {renderModalResponsables()}

            {/* Modal de Registro / Edición de Inseminación */}
            <div className="modal fade" id="inseminacionModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-3xl border-0 shadow-2xl overflow-hidden">
                        <div className="modal-header bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 py-3.5 px-5">
                            <div className="flex items-center gap-2">
                                <TbVaccine className="text-xl" />
                                <h1 className="modal-title fs-6 font-bold m-0">
                                    {rowToEdit.Id_Inseminacion
                                        ? `Editar Inseminación #${rowToEdit.Id_Inseminacion}`
                                        : "Nueva Inseminación Artificial"}
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
                            <InseminacionForm
                                hideModal={hideModal}
                                rowToEdit={rowToEdit}
                                refreshTable={() => {
                                    getAllInseminaciones();
                                    getColectas();
                                }}
                                preloaded={filtroDesdeCiclo || {}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudInseminacion;