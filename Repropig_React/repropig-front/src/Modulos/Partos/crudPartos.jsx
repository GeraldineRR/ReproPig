import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from 'react-data-table-component';
import PartosForm from "./PartoForm.jsx";
import { customTableStyles } from "../../styles/tableStyles.js";

const CrudPartos = () => {

    const [partos, setPartos] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [rowToEdit, setRowToEdit] = useState({});
    const navigate = useNavigate();

    // 🔹 Cerrar modal y refrescar tabla
    const hideModal = () => {
        const closeButton = document.getElementById('closeModal');
        if (closeButton) {
            closeButton.click();
        }
        getAllPartos();
    };

    // 🔹 Columnas de la tabla
    const columnsTable = [
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || row.porcinos?.Nom_Porcino || `Cerda #${row.Id_Porcino}`, sortable: true },
        { name: 'Fecha Inicio', selector: row => row.Fec_inicio ? row.Fec_inicio.split('T')[0] : '—', sortable: true },
        { name: 'Hora Inicio', selector: row => row.Hor_inicial || '—' },
        { name: 'Nac. Vivos', selector: row => row.Nac_vivos ?? 0, sortable: true },
        { name: 'Nac. Muertos', selector: row => row.Nac_muertos ?? 0, sortable: true },
        { name: 'Nac. Momias', selector: row => row.Nac_momias ?? 0, sortable: true },
        { 
            name: 'Total Nacidos', 
            selector: row => (Number(row.Nac_vivos || 0) + Number(row.Nac_muertos || 0) + Number(row.Nac_momias || 0)), 
            sortable: true,
            cell: row => <span className="fw-bold text-dark">{(Number(row.Nac_vivos || 0) + Number(row.Nac_muertos || 0) + Number(row.Nac_momias || 0))}</span>
        },
        { name: 'Peso Camada (kg)', selector: row => row.Pes_camada ? `${row.Pes_camada} kg` : '—', sortable: true },
        { name: 'Fecha Fin', selector: row => row.Fec_fin ? row.Fec_fin.split('T')[0] : '—' },
        { name: 'Hora Fin', selector: row => row.Hor_final || '—' },
        { name: 'Observaciones', selector: row => row.Observaciones || '—' },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex gap-2 align-items-center">
                    <button
                        className="btn btn-sm btn-primary text-white d-inline-flex align-items-center gap-1"
                        title="Seguimiento de Camada"
                        onClick={() => navigate(`/actividades_camada/parto/${row.Id_parto}`)}
                    >
                        <i className="fa-solid fa-baby"></i> Camada
                    </button>
                    <button
                        className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
                        title="Seguimiento de Cerda"
                        onClick={() => navigate(`/seguimiento_cerda/porcino/${row.Id_Porcino}`)}
                    >
                        <i className="fa-solid fa-notes-medical"></i> Cerda
                    </button>
                    <button
                        className="btn btn-sm btn-light border"
                        title="Editar Parto"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        onClick={() => setRowToEdit(row)}
                    >
                        <i className="fa-solid fa-pencil text-slate-600"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: '290px'
        }
    ];

    // 🔹 Cargar datos
    useEffect(() => {
        getAllPartos();
    }, []);

    const getAllPartos = async () => {
        try {
            const response = await apiAxios.get('/partos/');
            setPartos(response.data);
        } catch (error) {
            console.error("Error al obtener partos:", error);
        }
    };

    // 🔹 Filtro seguro
    const newListPartos = partos.filter((row) => {
        const textToSearch = filterText.toLowerCase();

        return (
            row.Id_parto?.toString().includes(textToSearch) ||
            row.Id_Porcino?.toString().includes(textToSearch) ||
            (row.Observaciones?.toLowerCase() || "").includes(textToSearch)
        );
    });

    return (
        <>
            <div className="container mt-5">

                <div className="row d-flex justify-content-between">
                    <div className="col-4">
                        <input
                            className="form-control"
                            placeholder="Buscar..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>

                    <div className="col-8 text-end">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => setRowToEdit({})}
                        >
                            Nuevo Registro
                        </button>
                    </div>
                </div>

                <DataTable
                    title={<h4 className="fw-bold text-gray-800 m-0 py-2">Registro de Partos</h4>}
                    columns={columnsTable}
                    data={newListPartos}
                    keyField="Id_parto"
                    pagination
                    highlightOnHover
                    striped
                    customStyles={customTableStyles}
                />

                {/* Modal */}
                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Partos</h1>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <PartosForm
                                    hideModal={hideModal}
                                    rowToEdit={rowToEdit}
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