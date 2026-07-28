import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from 'react-data-table-component';
import NovedadesForm from "./NovedadesForm.jsx";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const CrudNovedades = () => {
    const MySwal = withReactContent(Swal);

    const [novedades, setNovedades] = useState([]);
    const [novedadEdit, setNovedadEdit] = useState(null);
    const [filterText, setFilterText] = useState('');

    const columns = [
        {
            name: 'ID',
            selector: row => row.Id_Novedad,
            sortable: true,
            width: '80px'
        },
        {
            name: 'Porcino',
            selector: row => row.porcino?.Nom_Porcino || `Porcino #${row.Id_Porcino}`,
            sortable: true
        },
        {
            name: 'Tipo de Novedad',
            selector: row => {
                let badgeClass = 'bg-secondary';
                if (row.Tipo_Novedad === 'Muerte' || row.Tipo_Novedad === 'Descarte') badgeClass = 'bg-danger';
                else if (row.Tipo_Novedad === 'Enfermedad' || row.Tipo_Novedad === 'Lesión') badgeClass = 'bg-warning text-dark';
                else if (row.Tipo_Novedad === 'Traslado') badgeClass = 'bg-info text-dark';
                
                return <span className={`badge ${badgeClass}`}>{row.Tipo_Novedad}</span>;
            },
            sortable: true
        },
        {
            name: 'Fecha',
            selector: row => row.Fecha_Novedad?.split('T')[0]?.split('-').reverse().join('/'),
            sortable: true
        },
        {
            name: 'Causa / Motivo',
            selector: row => row.Causa_Motivo || '—'
        },
        {
            name: 'Observaciones',
            selector: row => row.Observaciones || '—'
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-info"
                        title="Editar Novedad"
                        onClick={() => handleEdit(row)}
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        title="Eliminar Novedad"
                        onClick={() => handleDelete(row.Id_Novedad)}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        getAllNovedades();
    }, []);

    const getAllNovedades = async () => {
        try {
            const response = await apiAxios.get('/novedades/');
            // Ordenar de más reciente a más antigua
            const sortedData = response.data.sort((a, b) => new Date(b.Fecha_Novedad) - new Date(a.Fecha_Novedad));
            setNovedades(sortedData);
        } catch (error) {
            console.error("Error al obtener novedades:", error);
        }
    };

    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede revertir",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.delete(`/novedades/${id}`);
                MySwal.fire('¡Eliminada!', 'La novedad fue eliminada.', 'success');
                getAllNovedades();
            } catch (error) {
                MySwal.fire('Error', 'No se pudo eliminar la novedad.', 'error');
            }
        }
    };

    const filteredNovedades = novedades.filter(nov => {
        const searchText = filterText.toLowerCase();
        const tipo = nov.Tipo_Novedad?.toLowerCase() || '';
        const causa = nov.Causa_Motivo?.toLowerCase() || '';
        const obs = nov.Observaciones?.toLowerCase() || '';
        const porcino = nov.porcino?.Nom_Porcino?.toLowerCase() || '';
        
        return tipo.includes(searchText) || 
               causa.includes(searchText) || 
               obs.includes(searchText) || 
               porcino.includes(searchText);
    });

    const hideModal = () => {
        setNovedadEdit(null);
        document.getElementById('closeModalNovedades').click();
    };

    const handleEdit = (novedad) => {
        setNovedadEdit(novedad);
        const modal = new bootstrap.Modal(document.getElementById('modalNovedades'));
        modal.show();
    };

    return (
        <div className="container mt-5">
            <div className="row d-flex mb-3 justify-content-between align-items-center">
                <div className="col-4">
                    <div className="input-group">
                        <span className="input-group-text">🔍</span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por porcino, tipo, causa..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-4 text-end">
                    <button
                        type="button"
                        className="btn btn-success"
                        data-bs-toggle="modal"
                        data-bs-target="#modalNovedades"
                        onClick={() => setNovedadEdit(null)}
                    >
                        + Registrar Novedad
                    </button>
                </div>
            </div>

            <DataTable
                title="Registro de Novedades"
                columns={columns}
                data={filteredNovedades}
                pagination
                highlightOnHover
                pointerOnHover
                striped
                noDataComponent="No hay novedades registradas"
            />

            <div className="modal fade" id="modalNovedades" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">
                                {novedadEdit ? "Editar Novedad" : "Registrar Nueva Novedad"}
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                id="closeModalNovedades"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <NovedadesForm
                                key={novedadEdit ? novedadEdit.Id_Novedad : 'new'}
                                hideModal={hideModal}
                                novedadEdit={novedadEdit}
                                reload={getAllNovedades}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudNovedades;
