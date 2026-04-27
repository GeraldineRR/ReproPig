import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import PartosForm from "./PartoForm.jsx";

const CrudPartos = () => {

    const [partos, setPartos] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [rowToEdit, setRowToEdit] = useState({});

    // Cerrar modal y refrescar tabla
    const hideModal = () => {
        const closeButton = document.getElementById("closeModal");
        if (closeButton) {
            closeButton.click();
        }
        getAllPartos();
    };

    // Obtener datos
    useEffect(() => {
        getAllPartos();
    }, []);

    const getAllPartos = async () => {
        try {
            const response = await apiAxios.get("/partos/");
            setPartos(response.data);
        } catch (error) {
            console.error("Error al obtener partos:", error);
        }
    };

    // Activar / Desactivar
    const cambiarEstado = async (row) => {
        try {
            const nuevoEstado =
                row.estado === "Activo"
                    ? "Inactivo"
                    : "Activo";

            await apiAxios.put(`/partos/estado/${row.Id_parto}`, {
                estado: nuevoEstado
            });

            getAllPartos();

        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    // Columnas de tabla
    const columnsTable = [
        {
            name: "Id_Porcino",
            selector: row => row.porcinos?.Nom_Porcino,
            sortable: true
        },
        {
            name: "Fec_inicio",
            selector: row => row.Fec_inicio
        },
        {
            name: "Hor_inicial",
            selector: row => row.Hor_inicial
        },
        {
            name: "Nac_vivos",
            selector: row => row.Nac_vivos
        },
        {
            name: "Nac_momias",
            selector: row => row.Nac_momias
        },
        {
            name: "Nac_muertos",
            selector: row => row.Nac_muertos
        },
        {
            name: "Pes_camada",
            selector: row => row.Pes_camada
        },
        {
            name: "Observaciones",
            selector: row => row.Observaciones
        },
        {
            name: "Fec_fin",
            selector: row => row.Fec_fin
        },
        {
            name: "Hor_final",
            selector: row => row.Hor_final
        },
        {
            name: "estado",
            selector: row => row.estado
        },
        {
            name: "Acciones",
            cell: (row) => (
                <div className="d-flex gap-2">

                    {/* Editar */}
                    <button
                        className="btn btn-sm bg-info"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        onClick={() => setRowToEdit(row)}
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>

                    {/* Activar / Desactivar */}
                    <button
                        className={`btn btn-sm ${
                            row.estado === "Activo"
                                ? "btn-danger"
                                : "btn-success"
                        }`}
                        onClick={() => cambiarEstado(row)}
                    >
                        {row.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"}
                    </button>

                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: '200px',
        }
    ];

    // Filtro
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
                    title="Registro de Partos"
                    columns={columnsTable}
                    data={newListPartos}
                    keyField="Id_parto"
                    pagination
                    highlightOnHover
                    striped
                />

                {/* Modal */}
                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                    aria-hidden="true"
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h1 className="modal-title fs-5">
                                    Partos
                                </h1>

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