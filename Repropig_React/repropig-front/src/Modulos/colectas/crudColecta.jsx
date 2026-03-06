import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import ColectaForm from "./colectaForm.jsx";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

const CrudColecta = () => {
    const MySwal = WithReactContent(Swal)
    const [colecta, setColecta] = useState([]);
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

    // ✅ Función eliminar con confirmación
    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará la colecta #${row.Id_colecta} permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await apiAxios.delete('/colectas/' + row.Id_colecta)
                MySwal.fire({ icon: 'success', title: 'Eliminado', text: 'Colecta eliminada correctamente' })
                getAllColectas()
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
            }
        }
    }

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_colecta, width: '70px' },
        { name: 'Fecha', selector: row => row.Fecha?.split('T')[0] || row.Fecha },
        { name: 'Uso', selector: row => row.Uso_colecta },
        { name: 'Tipo', selector: row => row.Tipo },
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || (row.Id_Porcino ? `#${row.Id_Porcino}` : '—') },
        { name: 'Responsables', selector: row => getNombresResponsables(row.Id_Responsable), wrap: true },
        { name: 'Volumen', selector: row => row.volumen },
        { name: 'Color', selector: row => row.color },
        { name: 'Olor', selector: row => row.olor },
        { name: 'Generada', selector: row => row.cant_generada },
        { name: 'Utilizada', selector: row => row.cant_utilizada },
        { name: 'Disponibles', cell: row => {
            const disp = (row.cant_generada || 0) - (row.cant_utilizada || 0)
            return <span className={disp <= 0 ? 'badge bg-danger' : disp <= 2 ? 'badge bg-warning' : 'badge bg-success'}>{disp}</span>
        }},
        { name: 'Observaciones', selector: row => row.Observaciones },
        {
            name: 'Acciones', cell: row => (
                <div className="d-flex gap-1">
                    {/* Editar */}
                    <button className="btn btn-sm btn-info"
                        onClick={() => setRowToEdit(row)}
                        data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    {/* ✅ Eliminar */}
                    <button className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row)}>
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        getAllColectas();
        getResponsables();
    }, []);

    const getAllColectas = async () => {
        const response = await apiAxios.get('/colectas');
        setColecta(response.data);
    };

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables')
            setResponsables(response.data)
        } catch (error) {
            console.error('Error al obtener responsables:', error)
        }
    }

    const newListcolecta = colecta.filter(item => {
        const text = filterText.toLowerCase().trim();
        const fecha = item.Fecha?.toString().toLowerCase() || '';
        const uso = item.Uso_colecta?.toString().toLowerCase() || '';
        const tipo = item.Tipo?.toString().toLowerCase() || '';
        const porcino = item.porcino?.Nom_Porcino?.toLowerCase() || '';
        const resps = getNombresResponsables(item.Id_Responsable).toLowerCase()

        const normalMatch = fecha.includes(text) || uso.includes(text) || tipo.includes(text)
            || porcino.includes(text) || resps.includes(text);
        const noMatch = text === 'no' && (uso === 'no' || tipo === 'no');
        return normalMatch || noMatch;
    });

    return (
        <div className="container mt-5">
            <div className="row d-flex justify-content-between align-items-center mb-3">
                <div className="col-4">
                    <input className="form-control" placeholder="🔍 Buscar..."
                        value={filterText} onChange={e => setFilterText(e.target.value)} />
                </div>
                <div className="col-2">
                    <button type="button" className="btn btn-primary"
                        data-bs-toggle="modal" data-bs-target="#exampleModal"
                        onClick={() => setRowToEdit({})}>
                        Nueva Colecta
                    </button>
                </div>
            </div>

            <DataTable title="Colectas" columns={columnsTable} data={newListcolecta}
                keyField="Id_colecta" pagination highlightOnHover striped />

            <div className="modal fade" id="exampleModal" tabIndex="-1"
                aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Nueva Colecta</h1>
                            <button type="button" className="btn-close"
                                data-bs-dismiss="modal" aria-label="Close" id="closeModal"></button>
                        </div>
                        <div className="modal-body">
                            <ColectaForm hideModal={hideModal} rowToEdit={rowToEdit} refreshTable={getAllColectas} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudColecta