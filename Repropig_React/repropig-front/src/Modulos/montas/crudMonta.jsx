import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // ✅ agregar
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import MontaForm from "./montaForm.jsx";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

const CrudMonta = () => {
    const MySwal = WithReactContent(Swal)
    const location = useLocation() // ✅ agregar
    const filtroDesdeReproduccion = location.state || null // ✅ { Id_Reproduccion, Id_Porcino }

    const [montas, setMontas] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [rowToEdit, setRowToEdit] = useState({});

    const hideModal = () => {
        document.getElementById('closeModal').click()
    }

    const getNombresResponsables = (Id_Responsable) => {
        if (!Id_Responsable || responsables.length === 0) return '—'
        try {
            let ids = []
            if (typeof Id_Responsable === 'string' && Id_Responsable.startsWith('[')) {
                ids = JSON.parse(Id_Responsable).map(Number)
            } else {
                ids = [Number(Id_Responsable)]
            }
            return ids.map(id => {
                const r = responsables.find(r => r.Id_Responsable === id)
                return r ? `${r.Nombres} ${r.Apellidos}` : `#${id}`
            }).join(', ')
        } catch { return Id_Responsable }
    }

    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará la monta #${row.Id_Monta} permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })
        if (result.isConfirmed) {
            try {
                await apiAxios.delete('/monta/' + row.Id_Monta)
                MySwal.fire({ icon: 'success', title: 'Eliminado', text: 'Monta eliminada correctamente' })
                getAllMontas()
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
            }
        }
    }

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Monta, width: '70px' },
        { name: 'Fecha', selector: row => row.Fec_hora?.split('T')[0] || row.Fec_hora },
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || row.Id_Porcino },
        { name: 'Responsables', selector: row => getNombresResponsables(row.Id_Responsable), wrap: true },
        { name: 'Observaciones', selector: row => row.Observaciones },
        { name: 'Id Reproduccion', selector: row => row.Id_Reproduccion },
        {
            name: 'Acciones', cell: row => (
                <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-info"
                        onClick={() => setRowToEdit(row)}
                        data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row)}>
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        getAllMontas();
        getResponsables();
    }, []);

    const getAllMontas = async () => {
        const response = await apiAxios.get('/monta/')
        setMontas(response.data)
        console.log(response.data)
    }

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables/')
            setResponsables(response.data)
        } catch (error) {
            console.error('Error al obtener responsables:', error)
        }
    }

    // ✅ Primero filtra por reproducción si viene desde Reproducciones
    const montasFiltradas = filtroDesdeReproduccion
        ? montas.filter(m => m.Id_Reproduccion == filtroDesdeReproduccion.Id_Reproduccion)
        : montas

    // ✅ Luego aplica el buscador sobre lo ya filtrado
    const newListMontas = montasFiltradas.filter(item => {
        const text = filterText.toLowerCase().trim();
        const fecha = item.Fec_hora?.toString().toLowerCase() || '';
        const porcino = item.porcino?.Nom_Porcino?.toLowerCase() || item.Id_Porcino?.toString() || '';
        const resps = getNombresResponsables(item.Id_Responsable).toLowerCase()
        return fecha.includes(text) || porcino.includes(text) || resps.includes(text);
    });

    return (
        <div className="container mt-5">

            {/* ✅ Banner de filtro activo */}
            {filtroDesdeReproduccion && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center py-2 mb-3">
                    <span>
                        🐷 Mostrando montas de la reproducción <strong>#{filtroDesdeReproduccion.Id_Reproduccion}</strong>
                    </span>
                    <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => window.history.replaceState({}, '', window.location.pathname)
                            || window.location.reload()}>
                        ✖ Ver todas
                    </button>
                </div>
            )}

            <div className="row d-flex justify-content-between align-items-center mb-3">
                <div className="col-4">
                    <input className="form-control" placeholder="🔍 Buscar..."
                        value={filterText} onChange={e => setFilterText(e.target.value)} />
                </div>
                <div className="col-2">
                    <button type="button" className="btn btn-primary"
                        data-bs-toggle="modal" data-bs-target="#exampleModal"
                        onClick={() => setRowToEdit({})}>
                        Nueva Monta
                    </button>
                </div>
            </div>

            <DataTable title="Montas" columns={columnsTable} data={newListMontas}
                keyField="Id_Monta" pagination highlightOnHover striped />

            <div className="modal fade" id="exampleModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Nueva Monta</h1>
                            <button type="button" className="btn-close"
                                data-bs-dismiss="modal" id="closeModal"></button>
                        </div>
                        <div className="modal-body">
                            {/* ✅ Si viene filtrado, pasa preloaded al form */}
                            <MontaForm
                                hideModal={hideModal}
                                rowToEdit={rowToEdit}
                                refreshTable={getAllMontas}
                                preloaded={filtroDesdeReproduccion || {}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudMonta