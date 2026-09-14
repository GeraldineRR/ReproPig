import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import ColectaForm from "./colectaForm.jsx";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

const CrudColecta = () => {
    const MySwal = WithReactContent(Swal)
    const navigate = useNavigate()
    const location = useLocation()
    const filtroDesdeInseminacion = location.state || null // { Id_colecta }
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
        {
            name: 'Vigencia', cell: row => {
                if (row.Tipo !== 'Interno') return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">N/A</span>;
                if (!row.Fecha) return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">—</span>;
                
                const fechaColecta = new Date(row.Fecha);
                const expirationDate = new Date(fechaColecta);
                expirationDate.setDate(expirationDate.getDate() + 3);
                const today = new Date();
                
                const diffTime = expirationDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 0) return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">Vencida</span>;
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">Vence en {diffDays} día{diffDays !== 1 ? 's' : ''}</span>;
            }
        },
        { name: 'Uso', selector: row => row.Uso_colecta },
        { name: 'Tipo', selector: row => row.Tipo },
        { name: 'Cerdo', selector: row => row.Tipo === 'Interno' ? (row.porcino?.Nom_Porcino || '—') : '' }, 
        { name: 'Responsables', selector: row => getNombresResponsables(row.Id_Responsable), wrap: true },
        { name: 'Volumen', selector: row => row.volumen },
        { name: 'Color', selector: row => row.color },
        { name: 'Olor', selector: row => row.olor },
        { name: 'Generada', selector: row => row.cant_generada },
        { name: 'Utilizada', selector: row => row.cant_utilizada },
        {
            name: 'Disponibles', cell: row => {
                const disp = (row.cant_generada || 0) - (row.cant_utilizada || 0)
                return <span className={disp <= 0 ? 'badge bg-danger' : disp <= 2 ? 'badge bg-warning' : 'badge bg-success'}>{disp}</span>
            }
        },
        { name: 'Observaciones', selector: row => row.Observaciones },
        {
            name: 'Acciones', cell: row => (
                <div className="flex gap-2 items-center justify-end w-full">
                    {/* Editar */}
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        onClick={() => setRowToEdit(row)}
                        data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <i className="fa-solid fa-pencil text-xs"></i>
                    </button>
                    {/* ✅ Eliminar */}
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        onClick={() => handleDelete(row)}>
                        <i className="fa-solid fa-trash text-xs"></i>
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
        const sortedData = response.data.sort((a, b) => new Date(b.Fecha || 0) - new Date(a.Fecha || 0))
        setColecta(sortedData);
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

            {/* Banner de filtro activo */}
            {filtroDesdeInseminacion && (
                <div className="alert alert-success d-flex justify-content-between align-items-center py-2 mb-3">
                    <span>
                        🧪 Mostrando colecta <strong>#{filtroDesdeInseminacion.Id_colecta}</strong>
                    </span>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        onClick={() => navigate(-1)}>
                        ← Volver a Inseminaciones
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
                        Nueva Colecta
                    </button>
                </div>
            </div>

            <DataTable title="Colectas" columns={columnsTable}
                data={newListcolecta.filter(c =>
                    !filtroDesdeInseminacion || c.Id_colecta == filtroDesdeInseminacion.Id_colecta
                )}
                keyField="Id_colecta" pagination highlightOnHover striped />

            <div className="modal fade" id="exampleModal" tabIndex="-1"
                aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">{rowToEdit.Id_colecta ? 'Editar Colecta' : 'Nueva Colecta'}</h1>
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