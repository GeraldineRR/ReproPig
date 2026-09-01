import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PartosForm from "./PartoForm.jsx";
<<<<<<< HEAD
import Swal from 'sweetalert2';
import WithReactContent from 'sweetalert2-react-content';
=======
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
>>>>>>> 4a943b4248b281d564369f620c8659763dd29229

const CrudPartos = () => {

    const [partos, setPartos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [partoEdit, setPartoEdit] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const navigate = useNavigate();

<<<<<<< HEAD
    // 🔹 Cerrar modal y refrescar tabla
    const hideModal = () => {
        const closeButton = document.getElementById('closeModal');
        if (closeButton) {
            closeButton.click();
        }
        getAllPartos();
    };

    const MySwal = WithReactContent(Swal);

    // 🔹 Toggle Estado de Parto con confirmación SweetAlert
    const toggleEstado = async (row) => {
        const esActivo = row.estado === 'Activo' || row.estado === 'A' || row.Estado === 'Activo' || !row.estado;
        const accion = esActivo ? 'inactivar' : 'activar';

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} este parto?`,
            text: `El parto #${row.Id_parto} pasará a estar ${esActivo ? 'Inactivo' : 'Activo'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/partos/${row.Id_parto}/toggle-estado`);
                MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                getAllPartos();
            } catch (error) {
                try {
                    const nuevoEstado = esActivo ? 'Inactivo' : 'Activo';
                    await apiAxios.put(`/partos/${row.Id_parto}`, { ...row, estado: nuevoEstado });
                    MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                    getAllPartos();
                } catch (err) {
                    MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.' });
                }
            }
        }
    };

    // 🔹 Columnas de la tabla
    const columnsTable = [
        { name: 'Id_Porcino', selector: row => row.porcinos?.Nom_Porcino, sortable: true },
        { name: 'Fec_inicio', selector: row => row.Fec_inicio },
        { name: 'Hor_inicial', selector: row => row.Hor_inicial },
        { name: 'Nac_vivos', selector: row => row.Nac_vivos },
        { name: 'Nac_momias', selector: row => row.Nac_momias },
        { name: 'Nac_muertos', selector: row => row.Nac_muertos },
        { name: 'Pes_camada', selector: row => row.Pes_camada },
        { name: 'Observaciones', selector: row => row.Observaciones },
        { name: 'Fec_fin', selector: row => row.Fec_fin },
        { name: 'Hor_final', selector: row => row.Hor_final },
        {
            name: 'Estado',
            cell: row => {
                const esActivo = row.estado === 'Activo' || row.estado === 'A' || row.Estado === 'Activo' || !row.estado;
                return (
                    <button
                        className={`badge border-0 ${esActivo ? 'bg-success' : 'bg-danger'}`}
                        onClick={() => toggleEstado(row)}
                        style={{ cursor: 'pointer' }}
                    >
                        {esActivo ? 'Activo' : 'Inactivo'}
                    </button>
                );
            }
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <button
                    className="btn btn-sm bg-info"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    onClick={() => setRowToEdit(row)}
                >
                    <i className="fa-solid fa-pencil"></i>
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ];

    // 🔹 Cargar datos
=======
>>>>>>> 4a943b4248b281d564369f620c8659763dd29229
    useEffect(() => {
        getAllPartos();
        getResponsables();
    }, []);

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
            const res = await apiAxios.get('/responsables/');
            setResponsables(res.data);
        } catch (error) {
            console.error("Error cargando responsables:", error);
        }
    };

    const parsearIDs = (valor) => {
        if (!valor) return []
        if (Array.isArray(valor)) return valor.map(Number)
        if (typeof valor === 'string' && valor.startsWith('[')) {
            try { return JSON.parse(valor).map(Number) } catch { return [] }
        }
        const num = Number(valor)
        return isNaN(num) ? [] : [num]
    };

    const getNombresResponsables = (val) => {
        const ids = parsearIDs(val)
        if (ids.length === 0) return '—'
        const nombres = ids.map(id => {
            const r = responsables.find(resp => Number(resp.Id_Responsable) === Number(id))
            return r ? `${r.Nombres} ${r.Apellidos || ''}`.trim() : `#${id}`
        })
        return nombres.join(', ')
    };

    // Función para alternar el estado del porcino 
    const toggleEstado = async (id) => {
        setLoadingId(id);

        try {
            const res = await apiAxios.put(`/Partos/${id}/toggle-estado`);

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
            name: "Peso Camada",
            selector: row =>
                row.Pes_camada
                    ? <span className="badge" style={{ backgroundColor: '#587EB2' }}>
                        {row.Pes_camada} kg
                    </span>
                    : '—'
        },
        {
            name: "Responsables",
            selector: row => getNombresResponsables(row.Id_Responsable),
            wrap: true
        },
        {
            name: "Observaciones",
            selector: row => row.Observaciones || '—'
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
                <div className="d-flex gap-2 flex-nowrap">
                    <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#975737' }}
                        title="Ver Seguimiento"
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
            minWidth: "150px"
        },
    ];

    const filtered = partos.filter(row => {
        const text = filterText.toLowerCase().trim();

        const porcino = row.porcino?.Nom_Porcino?.toLowerCase().trim() || "";
        const observaciones = row.Observaciones?.toLowerCase().trim() || "";
        const fechaFin = row.Fec_fin
            ? new Date(row.Fec_fin).toLocaleDateString()
            : "";
        const resps = getNombresResponsables(row.Id_Responsable).toLowerCase().trim();

        return (
            row.Id_parto?.toString().includes(text) ||
            porcino.includes(text) ||
            observaciones.includes(text) ||
            fechaFin.includes(text) ||
            resps.includes(text)
        );
    });

    return (
        <>
            <div className="container mt-5">

                <div className="row mb-3 justify-content-between">
                    <div className="col-4">
                        <div className="input-group">
                            <span className="input-group-text">
                                🔍
                            </span>
                            <input
                                className="form-control"
                                placeholder="Buscar por porcino, responsable, observaciones..."
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


export default CrudPartos