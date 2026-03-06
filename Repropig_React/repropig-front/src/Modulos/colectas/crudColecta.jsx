import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import ColectaForm from "./colectaForm.jsx";

const CrudColecta = () => {
    const [colecta, setColecta] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [rowToEdit, setRowToEdit] = useState({});

    const hideModal = () => {
        document.getElementById('closeModal').click()
    }

    const columnsTable = [
        { name: 'Id_colecta', selector: row => row.Id_colecta },
        { name: 'Fecha', selector: row => row.Fecha },
        { name: 'Uso_colecta', selector: row => row.Uso_colecta },
        { name: 'Tipo', selector: row => row.Tipo },
        { name: 'Id_Porcino', selector: row => row.porcino?.Id_Porcino || row.Id_Porcino },
        { name: 'Id_Responsables', selector: row => row.Id_Responsables },
        { name: 'Volumen', selector: row => row.volumen },
        { name: 'Color', selector: row => row.color },
        { name: 'Olor', selector: row => row.olor },
        { name: 'Generada', selector: row => row.cant_generada },
        { name: 'Utilizada', selector: row => row.cant_utilizada },
        { name: 'Observaciones', selector: row => row.Observaciones },
        { name: 'Acciones', selector: row =>(
            <button 
                className="btn btn-sm btn-info"
                onClick={() => setRowToEdit(row)}
                data-bs-toggle="modal"
                data-bs-target="#exampleModal">
                <i className="fa-solid fa-pencil"></i></button>
        )}
             
    ];

    useEffect(() => {
        getAllColectas();
    }, []);

    const getAllColectas = async () => {
        const response = await apiAxios.get('/api/colecta');
        setColecta(response.data);
    };

    // 🔍 Filtro (SOLO SE ARREGLA, NO SE CAMBIA)
    const newListcolecta = colecta.filter(item => {
        const text = filterText.toLowerCase().trim();

        const fecha = item.Fecha ? item.Fecha.toString().toLowerCase() : '';
        const Uso_colecta = item.Uso_colecta ? item.Uso_colecta.toString().toLowerCase() : '';
        const Tipo = item.Tipo ? item.Tipo.toString().toLowerCase() : '';

        // Filtra normal
        const normalMatch =
            fecha.includes(text) ||
            Uso_colecta.includes(text) ||
            Tipo.includes(text);

        // Filtra específicamente "no" solo para valores N o No
        const noMatch = text === 'no' && (Uso_colecta === 'n' || Uso_colecta === 'no' || Tipo === 'n' || Tipo === 'no');

        return normalMatch || noMatch;
    });


    return (
        <div className="container mt-5">
            <div className="row d-flex justify-content-between align-items-center mb-3">
                <div className="col-4">
                    <input className="form-control" value={filterText} onChange={e => setFilterText(e.target.value)} />
                </div>
                <div className="col-2">
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal"
                    onClick={() => setRowToEdit({})}> {/*limpiar el formulario para agregar un nuevo registro*/}
                        Nueva Colecta
                    </button>
                </div>
                <DataTable
                    title="Colectas"
                    columns={columnsTable}
                    data={newListcolecta}
                    keyField="Id_colecta"
                    pagination
                    highlightOnHover
                    striped
                />
            </div>
            { /*<!-- Button trigger modal -->*/}
            {/* <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Launch demo modal
</button> */}

            {/*<!-- Modal -->*/}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">

                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Nueva Colecta</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal"></button>
                        </div>
                        <div className="modal-body">
                            <ColectaForm hideModal={hideModal} rowToEdit={rowToEdit}refreshTable={getAllColectas}/>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrudColecta
