import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import PartosForm from "./PartoForm.jsx";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudPartos = () => {

    const [partos, setPartos] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [partoEdit, setPartoEdit] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

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

    const columnsTable = [
        {
            name: "Porcino",
            selector: row => row.porcinos?.Nom_Porcino || '—'
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
            selector: row => row.Observaciones
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
                <button
                    className="btn btn-sm bg-info"
                    onClick={() => handleEdit(row)}
                >
                    <i className="fa-solid fa-pencil"></i>
                </button>
            )
        }
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
            <div className="container mt-5">

                <div className="row mb-3 justify-content-between">
                    <div className="col-4">
                        <input
                            className="form-control"
                            placeholder="🔍 Buscar..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
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
                />

                {/* Modal */}
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

            </div>
        </>
    );
};


export default CrudPartos;