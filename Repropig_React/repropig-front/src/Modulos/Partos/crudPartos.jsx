import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PartosForm from "./PartoForm.jsx";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

// ─── Componente celda de observaciones con tooltip + click ───
const ObservacionCell = ({ row, formatFecha, onClickOpen }) => {
    const cellRef = useRef(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });
    const timeoutRef = useRef(null);
    const text = row.Observaciones || '';

    if (!text) return <span style={{ color: '#94a3b8' }}>—</span>;

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        timeoutRef.current = setTimeout(() => {
            setTooltip({ visible: true, x: rect.left, y: rect.top - 8 });
        }, 350);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeoutRef.current);
        setTooltip({ visible: false, x: 0, y: 0 });
    };

    return (
        <>
            <div
                ref={cellRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => { e.stopPropagation(); onClickOpen(row); }}
                style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                    cursor: 'pointer',
                    color: '#000000ff',
                    fontWeight: 400,
                    transition: 'color 0.2s',
                }}
                title=""
            >
                {text}
            </div>

            {/* Tooltip flotante */}
            {tooltip.visible && text.length > 20 && (
                <div
                    style={{
                        position: 'fixed',
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translateY(-100%)',
                        zIndex: 9999,
                        maxWidth: '340px',
                        padding: '10px 14px',
                        backgroundColor: '#1e293b',
                        color: '#f1f5f9',
                        borderRadius: '10px',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                        pointerEvents: 'none',
                        animation: 'tooltipFadeIn 0.2s ease',
                    }}
                >
                    {text}
                    <div style={{ marginTop: 6, fontSize: '11px', color: '#94a3b8' }}>
                        Click para ver detalle completo
                    </div>
                </div>
            )}
        </>
    );
};

const CrudPartos = () => {

    const [partos, setPartos] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [partoEdit, setPartoEdit] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const [obsModal, setObsModal] = useState(null); // Para el modal de observaciones
    const navigate = useNavigate();

    useEffect(() => {
        getAllPartos();
    }, []);

    const getAllPartos = async () => {
        try {
            const res = await apiAxios.get("/partos/");
            setPartos(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Función para alternar el estado del porcino 
    const toggleEstado = async (id) => {
        setLoadingId(id);

        try {
            const res = await apiAxios.put(`/partos/${id}/toggle-estado`);

            setPartos(prev =>
                prev.map(p =>
                    p.Id_parto === id
                        ? { ...p, estado: res.data.estado }
                        : p
                )
            );

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '—'
        return new Date(fecha).toLocaleDateString()
    }

    const handleEdit = (row) => {
        setPartoEdit(row);
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();
    };

    const hideModal = () => {
        setPartoEdit(null);
        document.getElementById("closeModal").click();
    };

    // Abrir modal de observación completa
    const openObsModal = (row) => {
        if (!row.Observaciones) return;
        setObsModal(row);
    };

    const closeObsModal = () => {
        setObsModal(null);
    };

    const columnsTable = [
        {
            name: "Porcino",
            selector: row => row.porcino?.Nom_Porcino || '—'
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
        {
            name: "Vivos",
            selector: row => row.Nac_vivos
        },
        {
            name: "Muertos",
            selector: row => row.Nac_muertos
        },
        {
            name: "Momias",
            selector: row => row.Nac_momias
        },
        {
            name: "Total",
            selector: row => row.Nac_vivos + row.Nac_muertos + row.Nac_momias ? <span className="badge" style={{ backgroundColor: '#000000' }}>
                {row.Nac_vivos + row.Nac_muertos + row.Nac_momias}
            </span>
                : '—'
        },
        {
            name: "Peso Camada",
            selector: row =>
                row.Pes_camada
                    ? <span className="badge" style={{ backgroundColor: '#587EB2' }}>
                        {row.Pes_camada} kg
                    </span>
                    : '—'
        },
        {
            name: "Observaciones",
            cell: row => (
                <ObservacionCell
                    row={row}
                    formatFecha={formatFecha}
                    onClickOpen={openObsModal}
                />
            ),
            minWidth: '180px',
            maxWidth: '220px',
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
            name: "Duración",
            selector: row => {
                if (!row.Fec_inicio || !row.Fec_fin) return '—';
                const inicio = new Date(row.Fec_inicio);
                const fin = new Date(row.Fec_fin);
                const diffDays = Math.floor((fin - inicio) / (1000 * 60 * 60));
                return `${diffDays} horas`;
            }
        },
        {
            name: 'Estado',
            selector: row => (
                <button
                    className={`badge border-0 ${row.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}
                    onClick={() => toggleEstado(row.Id_parto)}
                    disabled={loadingId === row.Id_parto}
                >
                    {loadingId === row.Id_parto
                        ? '...'
                        : row.estado}
                </button>
            )
        },
        {
            name: "Acciones",
            cell: row => (
                <div className="d-flex gap-2 flex-nowrap">
                    <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#362D34' }}
                        title="Ver Crías"
                        onClick={() => navigate(`/crias/parto/${row.Id_parto}`)}
                    >
                        🍼
                    </button>
                    <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#975737' }}
                        title="Seguimiento de camada"
                        onClick={() => navigate(`/segcamada/parto/${row.Id_parto}`)}
                    >
                        📝
                    </button>
                    <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#4b6e5b' }}
                        title="Seguimiento Cerda"
                        onClick={() => navigate(`/Seguimiento_Cerda/parto/${row.Id_parto}`)}
                    >
                        🩺
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
            minWidth: "190px"
        },
    ];

    const filtered = partos.filter(row => {
        const text = filterText.toLowerCase().trim();

        const porcino = row.porcinos?.Nom_Porcino?.toLowerCase().trim() || "";
        const observaciones = row.Observaciones?.toLowerCase().trim() || "";
        const fechaFin = row.Fec_fin
            ? new Date(row.Fec_fin).toLocaleDateString()
            : "";

        return (
            row.Id_parto?.toString().includes(text) ||
            porcino.includes(text) ||
            observaciones.includes(text) ||
            fechaFin.includes(text)
        );
    });

    return (
        <>
            {/* Animación para tooltip */}
            <style>{`
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateY(-90%); }
                    to   { opacity: 1; transform: translateY(-100%); }
                }
                @keyframes obsModalSlideIn {
                    from { opacity: 0; transform: scale(0.92) translateY(20px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes obsBackdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>

            <div className="container mt-5">

                <div className="row mb-3 justify-content-between">
                    <div className="col-4">
                        <div className="input-group">
                            <span className="input-group-text">
                                🔍
                            </span>
                            <input
                                className="form-control"
                                placeholder="Buscar..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-2">
                        <button
                            className="btn btn-success"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => setPartoEdit(null)}
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

                {/* Modal de edición / creación */}
                <div className="modal fade" id="exampleModal">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {partoEdit ? "Editar Parto" : "Nuevo Parto"}
                                </h5>

                                <button
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <PartosForm
                                    key={partoEdit ? partoEdit.Id_parto : 'new'}
                                    hideModal={hideModal}
                                    rowToEdit={partoEdit}
                                    reload={getAllPartos}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* ─── Modal de observación completa ─── */}
                {obsModal && (
                    <div
                        onClick={closeObsModal}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 10000,
                            backgroundColor: 'rgba(15, 23, 42, 0.55)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'obsBackdropIn 0.25s ease',
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '20px',
                                width: '100%',
                                maxWidth: '520px',
                                maxHeight: '80vh',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                animation: 'obsModalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '20px 24px 16px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div>
                                    <h5 style={{
                                        margin: 0,
                                        fontSize: '17px',
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        📋 Observación del Parto
                                    </h5>
                                    <div style={{
                                        display: 'flex',
                                        gap: '16px',
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        color: '#64748b',
                                    }}>
                                        <span>🐷 {obsModal.porcino?.Nom_Porcino || '—'}</span>
                                        <span>📅 {formatFecha(obsModal.Fec_inicio)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={closeObsModal}
                                    style={{
                                        border: 'none',
                                        background: '#f1f5f9',
                                        borderRadius: '10px',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#1e293b'; }}
                                    onMouseLeave={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#64748b'; }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body con scroll */}
                            <div style={{
                                padding: '20px 24px 24px',
                                overflowY: 'auto',
                                flex: 1,
                            }}>
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    padding: '18px 20px',
                                    fontSize: '14.5px',
                                    lineHeight: '1.7',
                                    color: '#334155',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    border: '1px solid #e2e8f0',
                                }}>
                                    {obsModal.Observaciones}
                                </div>

                                {/* Metadata extra */}
                                <div style={{
                                    marginTop: '16px',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                }}>
                                    <span style={{
                                        backgroundColor: '#eef2ff',
                                        color: '#4f46e5',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}>
                                        Vivos: {obsModal.Nac_vivos}
                                    </span>
                                    <span style={{
                                        backgroundColor: '#fef2f2',
                                        color: '#dc2626',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}>
                                        Muertos: {obsModal.Nac_muertos}
                                    </span>
                                    <span style={{
                                        backgroundColor: '#fefce8',
                                        color: '#a16207',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}>
                                        Momias: {obsModal.Nac_momias}
                                    </span>
                                    {obsModal.Pes_camada && (
                                        <span style={{
                                            backgroundColor: '#f0f9ff',
                                            color: '#0369a1',
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}>
                                            Peso: {obsModal.Pes_camada} kg
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};


export default CrudPartos;