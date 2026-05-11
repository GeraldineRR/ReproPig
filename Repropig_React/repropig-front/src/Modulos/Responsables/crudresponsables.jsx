import apiAxios from "../../api/axiosConfig.js";
import { useState, useEffect } from "react";
import DataTable from 'react-data-table-component'
import ResponsablesForm from "./responsablesForm.jsx";
import RegisterUsuario from "./RegisterUsuario.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const CrudResponsables = () => {

    const { usuario } = useAuth()
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
                    <button className="btn btn-sm bg-info me-2"
                        onClick={() => setRowToEdit(row)}
                        data-bs-toggle='modal'
                        data-bs-target="#exampleModal">
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button
                        className={`btn btn-sm ${row.Estado === 'Activo' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => cambiarEstado(row)}>
                        {row.Estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                </>
            )
        }
    ];

    // ✅ Después — también busca por cargo
const newlistResponsables = responsables.filter(responsable => {
    const textToSearch = filterText.toLowerCase();
    const nombre = responsable.Nombres?.toLowerCase() || '';
    const apellido = responsable.Apellidos?.toLowerCase() || '';
    const cargo = responsable.Cargo?.toLowerCase() || '';
    return nombre.includes(textToSearch) || apellido.includes(textToSearch) || cargo.includes(textToSearch)
})
    .sort((a, b) => b.Id_Responsable - a.Id_Responsable) // Desc

    const hidemodal = () => {
        document.getElementById('closeModal').click();
        getALLResponsables();
    };

    const hideModalRegister = () => {
        document.getElementById('closeModalRegister').click();
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex mb-3 justify-content-between">
                    <div className="col-4">
                        <input className="form-control" placeholder="Buscar..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)} />
                    </div>
                    <div className="col-auto d-flex gap-2">
                        {/* <button type="button" className="btn btn-primary"
                            data-bs-toggle="modal" data-bs-target="#exampleModal"
                            onClick={() => { setRowToEdit({}); setTextformbutton('Nuevo') }}>
                            Nuevo
                        </button> */}

                        {/* ✅ Botón crear usuario — solo para instructores */}
                        {usuario?.cargo === 'instructor' && (
                            <button type="button" className="btn btn-success"
                                data-bs-toggle="modal" data-bs-target="#modalRegister">
                                👤 Crear usuario
                            </button>
                        )}
                    </div>
                </div>

                <DataTable
                    title="Responsables"
                    columns={columnsTable}
                    data={newlistResponsables}
                    keyField="Id_Responsable"
                    pagination highlightOnHover striped
                />

                {/* Modal Responsable */}
                <div className="modal fade" id="exampleModal" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Responsable</h1>
                                <button type="button" className="btn-close"
                                    data-bs-dismiss="modal" id="closeModal"></button>
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

                {/* ✅ Modal Crear Usuario — solo instructores */}
                <div className="modal fade" id="modalRegister" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #E8A0A8, #C97A85)' }}>
                                <h1 className="modal-title fs-5 text-white">👤 Crear nuevo usuario</h1>
                                <button type="button" className="btn-close btn-close-white"
                                    data-bs-dismiss="modal" id="closeModalRegister"></button>
                            </div>
                            <div className="modal-body">
                                <RegisterUsuario
                                    hideModal={hideModalRegister}
                                    refreshTable={getALLResponsables}
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