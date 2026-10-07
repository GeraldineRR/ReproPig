import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { customTableStyles } from "../../styles/tableStyles.js";
import Seguimiento_CerdaForm from "./Seguimiento_CerdaForm.jsx";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

const CrudSeguimiento_Cerda = () => {
    // ==========================================
    // ESTADOS
    // ==========================================
    const [Seguimiento_Cerda, setSeguimiento_Cerda] = useState([]);
    const [porcinos, setPorcinos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [Seguimiento_CerdaEdit, setSeguimiento_CerdaEdit] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [modalKey, setModalKey] = useState(0);

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
                apiAxios.get("/medicamentos/")
            ]);

            const [segRes, porcRes, respRes, medRes] = results;

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
    // CAMBIAR ESTADO
    // ==========================================
    const toggleEstado = async (row) => {
        const esActivo =
            row.Estado === "Activo" ||
            row.Estado === "A" ||
            !row.Estado;

        const accion = esActivo ? "inactivar" : "activar";

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} este seguimiento de cerda?`,
            text: `El seguimiento pasará a estar ${esActivo ? "Inactivo" : "Activo"}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: esActivo ? "#d33" : "#198754",
            cancelButtonColor: "#6c757d",
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;

        try {
            await apiAxios.put(`/Seguimiento_Cerda/${row.Id_Seguimiento_Cerda}/toggle-estado`);
            await MySwal.fire({
                icon: "success",
                title: "Estado actualizado",
                timer: 1500,
                showConfirmButton: false
            });
            getAllSeguimiento_Cerda();
        } catch (error) {
            console.error("Error cambiando estado:", error.response?.data || error.message);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "No se pudo cambiar el estado."
            });
        }
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
            const estado = String(row.Estado || "").toLowerCase();
            const ciclo = String(row.Id_Ciclo || "").toLowerCase();

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
                respNames.includes(query) ||
                medNames.includes(query) ||
                fechaStr.includes(query) ||
                rawFecha.includes(query) ||
                horaStr.includes(query) ||
                obs.includes(query) ||
                estado.includes(query) ||
                ciclo.includes(query)
            );
        });
    }, [Seguimiento_Cerda, filterText, porcinosMap, responsablesMap, medicamentosMap]);

    // ==========================================
    // COLUMNAS (Sin columna Id)
    // ==========================================
    const columnsTable = [
        {
            name: "Fecha",
            selector: row => row.Fecha || "",
            sortable: true,
            cell: row => (
                <span className="text-dark">
                    {formatFecha(row.Fecha)}
                </span>
            ),
            width: "125px"
        },
        {
            name: "Hora",
            selector: row => row.Hora || "",
            sortable: true,
            cell: row => {
                if (!row.Hora) return <span className="text-secondary small">—</span>;

                const [horas, minutos] = String(row.Hora).split(":");

                let hora = parseInt(horas);
                const periodo = hora >= 12 ? "PM" : "AM";

                hora = hora % 12;
                if (hora === 0) hora = 12;

                const horaFormateada = `${String(hora).padStart(2, "0")}:${minutos} ${periodo}`;

                return (
                    <span className="text-secondary small">
                        {horaFormateada}
                    </span>
                );
            },
            width: "110px"
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
                if (!p) {
                    return <span className="text-muted">{row.Id_Porcino ? `Cerda #${row.Id_Porcino}` : "—"}</span>;
                }
                return (
                    <div className="d-flex align-items-center gap-1">
                        <span
                            className="badge px-2 py-1"
                            style={{
                                color: "#9d174d",
                                fontSize: "0.85rem"
                            }}
                        >
                            {p.Nom_Porcino}
                        </span>
                        {p.Num_Chapeta && (
                            <span className="text-muted small" title="Número de chapeta">
                                (#{p.Num_Chapeta})
                            </span>
                        )}
                    </div>
                );
            },
            minWidth: "160px"
        },
        {
            name: "Ciclo",
            selector: row => row.Id_Ciclo || 0,
            sortable: true,
            cell: row =>
                row.Id_Ciclo ? (
                    <span className="badge bg-light text-secondary border">
                        🔁 #{row.Id_Ciclo}
                    </span>
                ) : (
                    <span className="text-muted">—</span>
                ),
            width: "105px"
        },
        {
            name: "Responsables",
            cell: row => {
                const nombres = getResponsablesNames(row.Id_Responsable);
                if (!nombres.length) return <span className="text-muted">—</span>;
                return (
                    <div className="d-flex flex-wrap gap-1 py-1">
                        {nombres.map((nom, idx) => (
                            <span
                                key={idx}
                                className="text-dark"
                                style={{ fontSize: "0.8rem" }}
                            >
                                {nom}
                            </span>
                        ))}
                    </div>
                );
            },
            minWidth: "180px",
            wrap: true
        },
        {
            name: "Medicamentos",
            cell: row => {
                const meds = getMedicamentosNames(row.Id_Medicamento);
                if (!meds.length) return <span className="text-muted">—</span>;
                return (
                    <div className="d-flex flex-wrap gap-1 py-1">
                        {meds.map((nom, idx) => (
                            <span
                                key={idx}
                                className="text-dark"
                                style={{ fontSize: "0.8rem" }}
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
                        width: "100%",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}
                    className="small"
                    title={row.Observaciones || ""}
                >
                    {row.Observaciones || "—"}
                </div>
            ),
            wrap: true,
            minWidth: "220px",
            grow: 2
        },
        {
            name: "Estado",
            cell: row => {
                const esActivo =
                    row.Estado === "Activo" ||
                    row.Estado === "A" ||
                    !row.Estado;

                return (
                    <button
                        className={`badge border-0 ${esActivo ? "bg-success" : "bg-danger"}`}
                        onClick={() => toggleEstado(row)}
                        style={{ cursor: "pointer", fontSize: "0.8rem", padding: "6px 12px" }}
                        title="Clic para cambiar estado"
                    >
                        {esActivo ? "Activo" : "Inactivo"}
                    </button>
                );
            },
            width: "110px",
            center: true
        },
        {
            name: "Acciones",
            cell: row => (
                <div className="d-flex gap-1">
                    <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleEdit(row)}
                        title="Editar"
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button
                        className={`btn btn-sm ${row.Estado === "Inactivo" || row.Estado === "I"
                            ? "btn-success"
                            : "btn-warning text-dark"
                            }`}
                        onClick={() => toggleEstado(row)}
                        title={
                            row.Estado === "Inactivo" || row.Estado === "I"
                                ? "Activar"
                                : "Inactivar"
                        }
                    >
                        <i
                            className={`fa-solid ${row.Estado === "Inactivo" || row.Estado === "I"
                                ? "fa-check"
                                : "fa-ban"
                                }`}
                        ></i>
                    </button>
                </div>
            ),
            width: "110px"
        }
    ];

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="container mt-5">
            {/* CABECERA */}
            <div className="row d-flex mb-3 justify-content-between align-items-center g-2">
                <div className="col-md-7 d-flex gap-2">
                    {partoIdParams && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/partos")}
                            title="Volver a Partos"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                    )}

                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control border-start-0"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            placeholder="🔍 Buscar por cerda, responsable, medicamento, fecha..."
                        />
                    </div>
                </div>

                <div className="col-md-4 text-end">
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleNuevo}
                    >
                        + Registrar seguimiento
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <div className="table-responsive">
                <DataTable
                    title={
                        <h4 className="text-gray-800 m-0 py-2">
                            Seguimiento Cerda
                        </h4>
                    }
                    columns={columnsTable}
                    data={newListSeguimiento_Cerda}
                    keyField="Id_Seguimiento_Cerda"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    customStyles={customTableStyles}
                    noDataComponent="No hay seguimientos registrados"
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
        </div>
    );
};

export default CrudSeguimiento_Cerda;