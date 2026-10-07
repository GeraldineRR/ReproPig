import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import PartosForm from "./PartoForm.jsx";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const CrudPartos = () => {

    const [partos, setPartos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [partoEdit, setPartoEdit] = useState(null);
    const [preloadedData, setPreloadedData] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const MySwal = WithReactContent(Swal);

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

    // Abrir modal automaticamente si viene con datos desde ciclos/calendario
    useEffect(() => {
        if (location.state && (location.state.Id_Ciclo || location.state.Id_Porcino)) {
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
                    Hor_inicial: incomingState.Hor_inicial || "08:00",
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

    const columnsTable = [
        {
            name: "Porcino",
            selector: row => row.porcino?.Nom_Porcino || "---",
            sortable: true
        },
        {
            name: "Ciclo",
            cell: row =>
                row.Id_Ciclo
                    ? <span className="badge bg-secondary">#{row.Id_Ciclo}</span>
                    : <span className="text-muted small">---</span>,
            sortable: true,
            width: "80px"
        },
        {
            name: "Inicio",
            cell: row => (
                <div>
                    <div>{formatFecha(row.Fec_inicio)}</div>
                    <small className="text-muted">{row.Hor_inicial}</small>
                </div>
            )
        },
        { name: "Vivos", selector: row => row.Nac_vivos },
        { name: "Muertos", selector: row => row.Nac_muertos },
        { name: "Momias", selector: row => row.Nac_momias },
        {
            name: "Peso Camada",
            cell: row =>
                row.Pes_camada
                    ? <span className="badge" style={{ backgroundColor: "#587EB2" }}>{row.Pes_camada} kg</span>
                    : "---"
        },
        {
            name: "Responsables",
            selector: row => getNombresResponsables(row.Id_Responsable),
            wrap: true
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
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}
                    className="small"
                    title={row.Observaciones || ""}
                >
                    {row.Observaciones || "---"}
                </div>
            ),
            wrap: true,
            minWidth: "200px",
            grow: 2
        },
        {
            name: "Fin",
            cell: row => (
                <div>
                    <div>{formatFecha(row.Fec_fin)}</div>
                    <small className="text-muted">{row.Hor_final}</small>
                </div>
            )
        },
        {
            name: "Estado",
            cell: row => (
                <button
                    className={`badge border-0 ${row.estado === "Activo" ? "bg-success" : "bg-danger"}`}
                    onClick={() => toggleEstado(row.Id_parto)}
                    disabled={loadingId === row.Id_parto}
                >
                    {loadingId === row.Id_parto ? "..." : row.estado}
                </button>
            )
        },
        {
            name: "Acciones",
            cell: row => (
                <div className="d-flex gap-2 flex-nowrap">
                    <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: "#975737" }}
                        title="Ver Seguimiento de Camada"
                        onClick={() => navigate(`/actividades_camada/parto/${row.Id_parto}`)}
                    >
                        📝
                    </button>
                    <button
                        className="btn btn-sm bg-info"
                        title="Editar Parto"
                        onClick={() => handleEdit(row)}
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                </div>
            ),
            minWidth: "120px"
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
            <div className="container mt-5">

                <div className="row mb-3 justify-content-between">
                    <div className="col-md-5">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="🔍 Buscar por porcino, ciclo, responsable..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-2">
                        <button
                            className="btn btn-success"
                            data-bs-toggle="modal"
                            data-bs-target="#modalParto"
                            onClick={handleNuevoParto}
                        >
                            + Registrar parto
                        </button>
                    </div>
                </div>

                <DataTable
                    title="Registro de Partos"
                    columns={columnsTable}
                    data={filtered}
                    keyField="Id_parto"
                    pagination
                    highlightOnHover
                    striped
                    responsive
                />

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
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default CrudPartos;
