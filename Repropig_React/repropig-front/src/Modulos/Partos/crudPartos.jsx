import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from 'react-data-table-component';
import PartosForm from "./PartoForm.jsx";
import { customTableStyles } from "../../styles/tableStyles.js";
import PorcinoForm from "../porcinos/porcinoForm.jsx";
import ModalLechonesParto from "./ModalLechonesParto.jsx";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ModalResponsables, BotonResponsables } from "../../components/ModalResponsables.jsx";
import { getListaResponsables } from "../../utils/responsablesUtils.js";
import { formatearFecha, formatearHora } from "../../utils/dateUtils.js";
import {
    TbBabyCarriage,
    TbSearch,
    TbPlus,
    TbPencil,
    TbTrash,
    TbUsers,
    TbInfoCircle,
    TbPig
} from "react-icons/tb";

const CrudPartos = () => {

    const [partos, setPartos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [partoEdit, setPartoEdit] = useState(null);
    const [preloadedData, setPreloadedData] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const [lechonLoop, setLechonLoop] = useState({ active: false, Id_parto: null, total: 0, current: 0, Fec_Nac: null });
    const [modalResponsablesData, setModalResponsablesData] = useState(null);
    const [modalLechonesParto, setModalLechonesParto] = useState({ isOpen: false, parto: null });
    const navigate = useNavigate();
    const location = useLocation();

    const MySwal = WithReactContent(Swal);

    const handleVerLechones = (partoRow) => {
        setModalLechonesParto({
            isOpen: true,
            parto: partoRow
        });
    };

    const getAllPartos = async () => {
        try {
            const res = await apiAxios.get("/Partos/");
            setPartos(res.data);
        } catch (error) {
            console.error("Error cargando partos:", error);
        }
    };

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get("/responsables/");
            setResponsables(res.data);
        } catch (error) {
            console.error("Error cargando responsables:", error);
        }
    };

    useEffect(() => {
        getAllPartos();
        getResponsables();
    }, []);

    // Abrir modal automaticamente si viene con datos desde ciclos/calendario o notificaciones
    useEffect(() => {
        if (location.state?.openLechonesPartoId) {
            const incomingPartoId = location.state.openLechonesPartoId;
            navigate('/partos', { replace: true, state: null });
            const partoEncontrado = partos.find(p => p.Id_parto === Number(incomingPartoId)) || { Id_parto: Number(incomingPartoId) };
            handleVerLechones(partoEncontrado);
            return;
        }

        if (location.state?.resumePartoId) {
            const incomingState = { ...location.state };
            navigate('/partos', { replace: true, state: null });

            setLechonLoop({
                active: true,
                Id_parto: incomingState.resumePartoId,
                total: incomingState.nacVivos,
                current: incomingState.registrados + 1,
                Fec_Nac: incomingState.fecNac,
                nombreMadre: incomingState.nombreMadre
            });

            setTimeout(() => {
                const lechonModalEl = document.getElementById("modalLechonFromParto");
                if (lechonModalEl) {
                    const modal = bootstrap.Modal.getOrCreateInstance(lechonModalEl, { backdrop: 'static', keyboard: false });
                    modal.show();
                }
            }, 300);

        } else if (location.state && (location.state.Id_Ciclo || location.state.Id_Porcino)) {
            const incomingState = { ...location.state };
            navigate('/partos', { replace: true, state: null });

            const idCicloParam = incomingState.Id_Ciclo;
            const partoExistente = idCicloParam && partos.length > 0
                ? partos.find(p => String(p.Id_Ciclo) === String(idCicloParam))
                : null;

            if (partoExistente) {
                setPartoEdit(partoExistente);
                setPreloadedData(null);
            } else {
                setPartoEdit(null);
                setPreloadedData({
                    Id_Porcino: incomingState.Id_Porcino || "",
                    Id_Ciclo: incomingState.Id_Ciclo || "",
                    Fec_inicio: incomingState.Fec_inicio || "",
                    Fec_fin: incomingState.Fec_fin || incomingState.Fec_inicio || "",
                    Hor_inicial: incomingState.Hor_inicial || "",
                    Observaciones: incomingState.Observaciones || ""
                });
            }

            setTimeout(() => {
                const modalEl = document.getElementById("modalParto");
                if (modalEl) {
                    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                    modal.show();
                }
            }, 200);
        }
    }, [location.state, partos]);

    // Listener para limpiar backdrops y estados cuando el modal se oculta
    useEffect(() => {
        const modalEl = document.getElementById("modalParto");
        if (!modalEl) return;

        const handleHidden = () => {
            setPartoEdit(null);
            setPreloadedData(null);
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        };

        modalEl.addEventListener('hidden.bs.modal', handleHidden);

        return () => {
            modalEl.removeEventListener('hidden.bs.modal', handleHidden);
            const inst = bootstrap.Modal.getInstance(modalEl);
            if (inst) inst.hide();
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        };
    }, []);

    const parsearIDs = (valor) => {
        if (!valor) return [];
        if (Array.isArray(valor)) return valor.map(Number);
        if (typeof valor === "string" && valor.startsWith("[")) {
            try { return JSON.parse(valor).map(Number); } catch { return []; }
        }
        const num = Number(valor);
        return isNaN(num) ? [] : [num];
    };

    const getNombresResponsables = (val) => {
        const ids = parsearIDs(val);
        if (ids.length === 0) return "---";
        const nombres = ids.map(id => {
            const r = responsables.find(resp => Number(resp.Id_Responsable) === Number(id));
            return r ? `${r.Nombres} ${r.Apellidos || ""}`.trim() : `#${id}`;
        });
        return nombres.join(", ");
    };

    const toggleEstado = async (id) => {
        setLoadingId(id);
        try {
            const res = await apiAxios.put(`/Partos/${id}/toggle-estado`);
            setPartos(prev =>
                prev.map(p =>
                    p.Id_parto === id ? { ...p, estado: res.data.estado } : p
                )
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "---";
        return new Date(fecha).toLocaleDateString();
    };

    const handleEdit = (row) => {
        setPreloadedData(null);
        setPartoEdit(row);
        const modalEl = document.getElementById("modalParto");
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    };

    const handleNuevoParto = () => {
        setPartoEdit(null);
        setPreloadedData(null);
    };

    const hideModal = () => {
        setPartoEdit(null);
        setPreloadedData(null);
        const modalEl = document.getElementById("modalParto");
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
            }
        }
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        }, 150);
    };

    const handlePartoCreated = (idParto, nacVivos, fecNac) => {
        setLechonLoop({
            active: true,
            Id_parto: idParto,
            total: nacVivos,
            current: 1,
            Fec_Nac: fecNac
        });

        setTimeout(() => {
            const lechonModalEl = document.getElementById("modalLechonFromParto");
            if (lechonModalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(lechonModalEl, { backdrop: 'static', keyboard: false });
                modal.show();
            }
        }, 500);
    };

    const handleLechonSuccess = () => {
        setLechonLoop(prev => {
            const next = prev.current + 1;

            if (next > prev.total) {
                // Done!
                const lechonModalEl = document.getElementById("modalLechonFromParto");
                if (lechonModalEl) {
                    const modal = bootstrap.Modal.getInstance(lechonModalEl);
                    if (modal) modal.hide();
                }

                MySwal.fire({
                    icon: 'success',
                    title: '¡Excelente!',
                    text: 'Todos los lechones han sido registrados exitosamente.',
                    timer: 3000,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.classList.remove('modal-open');
                    window.dispatchEvent(new Event('refreshNotificaciones'));
                }, 300);

                return { active: false, Id_parto: null, total: 0, current: 0, Fec_Nac: null, nombreMadre: null };
            } else {
                MySwal.fire({
                    title: `Lechón ${prev.current} registrado`,
                    icon: "success",
                    timer: 1000,
                    showConfirmButton: false
                });
                window.dispatchEvent(new Event('refreshNotificaciones'));
                return { ...prev, current: next };
            }
        });
    };

    const handleLechonCancel = () => {
        const faltantes = lechonLoop.total - lechonLoop.current + 1;

        MySwal.fire({
            title: '¿Estás seguro?',
            text: `Te faltaron ${faltantes} lechones por registrar para seguir la cadena del parto. ¿Quieres salir de todas formas?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Continuar registrando'
        }).then((result) => {
            if (result.isConfirmed) {
                const lechonModalEl = document.getElementById("modalLechonFromParto");
                if (lechonModalEl) {
                    const modal = bootstrap.Modal.getInstance(lechonModalEl);
                    if (modal) modal.hide();
                }
                setLechonLoop({ active: false, Id_parto: null, total: 0, current: 0, Fec_Nac: null, nombreMadre: null });

                // Show notification of missing piglets
                MySwal.fire({
                    icon: 'info',
                    title: 'Registro incompleto',
                    text: `Recuerda que faltaron ${faltantes} lechones por registrar de este parto.`
                });

                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.classList.remove('modal-open');
                    window.dispatchEvent(new Event('refreshNotificaciones'));
                }, 300);
            }
        });
    };

    const columnsTable = [
        {
            name: "Porcino",
            selector: row => row.porcino?.Nom_Porcino || "---",
            sortable: true,
            minWidth: "160px",
            cell: row => (
                <div className="flex items-center gap-2.5 py-1">
                    <div>
                        <div className="font-semibold text-gray-900 text-xs">
                            {row.porcino?.Nom_Porcino || "---"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                            {row.porcino?.Num_Chapeta ? `Chapeta: ${row.porcino.Num_Chapeta}` : `ID: #${row.Id_Porcino}`}
                        </div>
                    </div>
                </div>
            )
        },
        {
            name: "Ciclo",
            cell: row =>
                row.Id_Ciclo ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                        #{row.Id_Ciclo}
                    </span>
                ) : (
                    <span className="text-gray-400 text-xs">---</span>
                ),
            sortable: true,
            width: "90px"
        },
        {
            name: "Inicio",
            cell: row => (
                <div className="py-1">
                    <div className="text-xs font-medium text-gray-800">{formatearFecha(row.Fec_inicio)}</div>
                    <div className="text-[11px] text-gray-400">{formatearHora(row.Hor_inicial) || row.Hor_inicial || ""}</div>
                </div>
            ),
            sortable: true,
            width: "120px"
        },
        {
            name: "Vivos",
            center: true,
            width: "80px",
            cell: row => (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    {row.Nac_vivos ?? 0}
                </span>
            )
        },
        {
            name: "Muertos",
            center: true,
            width: "85px",
            cell: row => (
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs border ${row.Nac_muertos > 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                    {row.Nac_muertos ?? 0}
                </span>
            )
        },
        {
            name: "Momias",
            center: true,
            width: "85px",
            cell: row => (
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs border ${row.Nac_momias > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                    {row.Nac_momias ?? 0}
                </span>
            )
        },
        {
            name: "Peso Camada",
            width: "115px",
            cell: row =>
                row.Pes_camada ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
                        {row.Pes_camada} kg
                    </span>
                ) : (
                    <span className="text-gray-400 text-xs">---</span>
                )
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
                                titulo: "Responsables del Parto",
                                subtitulo: `Parto #${row.Id_parto} — Cerda ${row.porcino?.Nom_Porcino || `#${row.Id_Porcino}`}`,
                                responsables: lista,
                                theme: "pink"
                            })
                        }
                    />
                );
            }
        },
        {
            name: "Observaciones",
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
                    {row.Observaciones || "---"}
                </div>
            ),
            wrap: true,
            minWidth: "180px",
            grow: 2
        },
        {
            name: "Fin",
            cell: row => (
                <div className="py-1">
                    <div className="text-xs font-medium text-gray-800">{formatearFecha(row.Fec_fin)}</div>
                    <div className="text-[11px] text-gray-400">{formatearHora(row.Hor_final) || row.Hor_final || ""}</div>
                </div>
            ),
            width: "120px"
        },
        {
            name: "Acciones",
            cell: row => (
                <div className="flex items-center gap-1.5">
                    <button
                        className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition-colors shadow-xs"
                        title="Ver Lechones"
                        onClick={() => handleVerLechones(row)}
                    >
                        <TbPig className="w-4 h-4" />
                    </button>
                    <button
                        className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center transition-colors shadow-xs"
                        title="Ver Seguimiento de Camada"
                        onClick={() => navigate(`/actividades_camada/parto/${row.Id_parto}`)}
                    >
                        <TbInfoCircle className="w-4 h-4" />
                    </button>
                    <button
                        className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors shadow-xs"
                        title="Editar Parto"
                        onClick={() => handleEdit(row)}
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                </div>
            ),
            minWidth: "135px"
        }
    ];

    const filtered = partos.filter(row => {
        const text = filterText.toLowerCase().trim();
        const porcino = row.porcino?.Nom_Porcino?.toLowerCase() || "";
        const obs = row.Observaciones?.toLowerCase() || "";
        const resps = getNombresResponsables(row.Id_Responsable).toLowerCase();
        const ciclo = row.Id_Ciclo?.toString() || "";
        return (
            row.Id_parto?.toString().includes(text) ||
            porcino.includes(text) ||
            obs.includes(text) ||
            resps.includes(text) ||
            ciclo.includes(text)
        );
    });

    return (
        <>
            <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                            <TbBabyCarriage className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Registro de Partos</h1>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/60">
                                    {partos.length} registros
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Control de partos, camadas, lechones nacidos vivos, muertos y seguimiento</p>
                        </div>
                    </div>
                    <button
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-md hover:from-pink-700 hover:to-rose-700 hover:shadow-lg transition-all duration-200"
                        data-bs-toggle="modal"
                        data-bs-target="#modalParto"
                        onClick={handleNuevoParto}
                    >
                        <TbPlus className="w-5 h-5" />
                        <span>Registrar Parto</span>
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Listado de Partos</h2>
                            <p className="text-xs text-gray-400">Detalle de partos registrados y resultados de camadas</p>
                        </div>
                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder:text-gray-400"
                                placeholder="Buscar por porcino, ciclo, responsable..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={filtered}
                        keyField="Id_parto"
                        pagination
                        highlightOnHover
                        striped
                        customStyles={customTableStyles}
                        responsive
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No se encontraron partos registrados
                            </div>
                        }
                    />
                </div>

                <div className="modal fade" id="modalParto">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {partoEdit
                                        ? "Editar Parto"
                                        : preloadedData
                                            ? "Registrar Parto (desde Ciclo)"
                                            : "Nuevo Parto"}
                                </h5>
                                <button
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModalParto"
                                    onClick={hideModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <PartosForm
                                    key={partoEdit ? partoEdit.Id_parto : (preloadedData ? `pre-${preloadedData.Id_Ciclo}` : "new")}
                                    hideModal={hideModal}
                                    rowToEdit={partoEdit}
                                    preloaded={preloadedData}
                                    reload={getAllPartos}
                                    onPartoCreated={handlePartoCreated}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for Lechon Loop */}
                {lechonLoop.active && (
                    <div className="modal fade" id="modalLechonFromParto" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-warning">
                                    <h5 className="modal-title fw-bold">
                                        Cadena de Parto - Lechón {lechonLoop.current} de {lechonLoop.total}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleLechonCancel}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <PorcinoForm
                                        key={`lechon_${lechonLoop.Id_parto}_${lechonLoop.current}`}
                                        hideModal={handleLechonCancel}
                                        reload={null}
                                        initialTipo='Lechon'
                                        onSuccess={handleLechonSuccess}
                                        forcedPartoId={lechonLoop.Id_parto}
                                        forcedFecNac={lechonLoop.Fec_Nac}
                                        loopInfo={{ current: lechonLoop.current, total: lechonLoop.total, nombreMadre: lechonLoop.nombreMadre }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Responsables */}
                <ModalResponsables
                    data={modalResponsablesData}
                    onClose={() => setModalResponsablesData(null)}
                />

                {/* Modal para ver y actualizar lechones del parto */}
                <ModalLechonesParto
                    isOpen={modalLechonesParto.isOpen}
                    parto={modalLechonesParto.parto}
                    onClose={() => setModalLechonesParto({ isOpen: false, parto: null })}
                    onUpdated={getAllPartos}
                />

            </div>
        </>
    );
};

export default CrudPartos;
