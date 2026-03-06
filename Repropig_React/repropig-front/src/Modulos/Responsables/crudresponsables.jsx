import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import DataTable from 'react-data-table-component'
import ResponsablesForm from "./responsablesForm.jsx";

const CrudResponsables = () => {    

    const [responsables, setResponsables] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [rowToEdit, setRowToEdit] = useState(null);
    const [textformbutton, setTextformbutton] = useState('Enviar');

    useEffect(() => {
        getALLResponsables();
    }, []);

    const getALLResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables');
            setResponsables(response.data);
        } catch (error) {
            console.error("Error al cargar responsables:", error);
        }
    };

    // ✅ Cambiar estado con campo Estado y valores 'Activo'/'Inactivo'
    const cambiarEstado = async (row) => {
        try {
            await apiAxios.put(`/responsables/${row.Id_Responsable}`, {
                Estado: row.Estado === 'Activo' ? 'Inactivo' : 'Activo'
            });
            getALLResponsables();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Responsable },
        { name: 'Nombres', selector: row => `${row.Nombres} ${row.Apellidos}` },
        { name: 'Documento', selector: row => row.Documento },
        { name: 'Cargo', selector: row => row.Cargo },
        { name: 'Telefono', selector: row => row.Telefono },
        { name: 'Email', selector: row => row.Email },
        {
            name: 'Estado',
            cell: row => (
                row.Estado === 'Activo'
                    ? <span className="badge bg-success">Activo</span>
                    : <span className="badge bg-danger">Inactivo</span>
            )
        },
        {
            name: 'Acciones',
            width: '160px',
            cell: row => (
                <>
                    <button
                        className="btn btn-sm bg-info me-2"
                        onClick={() => setRowToEdit(row)}
                        data-bs-toggle='modal'
                        data-bs-target="#exampleModal">
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    {/* ✅ Botón activar/desactivar con Estado */}
                    <button
                        className={`btn btn-sm ${row.Estado === 'Activo' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => cambiarEstado(row)}>
                        {row.Estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                </>
            )
        }
    ];

    const newlistResponsables = responsables.filter(responsable => {
        const textToSearch = filterText.toLowerCase();
        const nombre = responsable.Nombres?.toLowerCase() || '';
        const apellido = responsable.Apellidos?.toLowerCase() || '';
        return nombre.includes(textToSearch) || apellido.includes(textToSearch)
    });

    const hidemodal = () => {
        document.getElementById('closeModal').click();
        getALLResponsables();
    };

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
                    <div className="col-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => { setRowToEdit({}); setTextformbutton('Nuevo') }}>
                            Nuevo
                        </button>
                    </div>
                </div>

                <DataTable
                    title="Responsables"
                    columns={columnsTable}
                    data={newlistResponsables}
                    keyField="Id_Responsable"
                    pagination
                    highlightOnHover
                    striped
                />

                <div className="modal fade" id="exampleModal" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Responsable</h1>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModal">
                                </button>
                            </div>
                            <div className="modal-body">
                                <ResponsablesForm
                                    hidemodal={hidemodal}
                                    rowToEdit={rowToEdit}
                                    textformbutton={textformbutton}
                                    setTextformbutton={setTextformbutton}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CrudResponsables;