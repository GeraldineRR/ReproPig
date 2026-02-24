import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig.js";
import DataTable from "react-data-table-component";
import MontaForm from "./montaForm.jsx";

const CrudMonta = () => {
    const [montas, setMontas] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [rowToEdit, setRowToEdit] = useState({});

    const hideModal = () => {
        document.getElementById('closeModal').click()
    }

    const columnsTable = [
        { name: 'Id_Monta', selector: row => row.Id_Monta },
        { name: 'Fec_hora', selector: row => row.Fec_hora },
        { name: 'Id_Porcino', selector: row => row.Id_Porcino },
        { name: 'Id_Responsables', selector: row => row.Id_Responsables },
        { name: 'Observaciones', selector: row => row.Observaciones },
        { name: 'Id_Reproduccion', selector: row => row.Id_Reproduccion },
        {
            name: 'Acciones', selector: row => (
                <button
                    className="btn btn-sm btn-info"
                    onClick={() => setRowToEdit(row)}
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal">
                    <i className="fa-solid fa-pencil"></i></button>
            )
        }

    ];

    useEffect(() => {
        getAllMontas();
    }, []);

    const getAllMontas = async () => {
        const response = await apiAxios.get('/api/monta');
        setMontas(response.data);
    };

    // 🔍 Filtro (SOLO SE ARREGLA, NO SE CAMBIA)
    const newListMontas = montas.filter(item => {
        const text = filterText.toLowerCase().trim();

        const fecha = item.Fec_hora ? item.Fec_hora.toString().toLowerCase() : '';
        const porcino = item.Id_Porcino ? item.Id_Porcino.toString().toLowerCase() : '';
        const reproduccion = item.Id_Reproduccion ? item.Id_Reproduccion.toString().toLowerCase() : '';

        return (
            fecha.includes(text) ||
            porcino.includes(text) ||
            reproduccion.includes(text)
        );
    });


return (
  <div className="container mt-5">

    {/* Barra superior */}
    <div className="row d-flex justify-content-between align-items-center mb-3">
      <div className="col-4">
        <input
          className="form-control"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
      </div>

      <div className="col-2">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
          onClick={() => setRowToEdit({})}
        >
          Nueva Monta
        </button>
      </div>
    </div>

    {/* Tabla */}
    <DataTable
      title="Montas"
      columns={columnsTable}
      data={newListMontas}
      keyField="Id_Monta"
      pagination
      highlightOnHover
      striped
    />

    {/* Modal */}
    <div className="modal fade" id="exampleModal" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Nueva Monta</h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              id="closeModal"
            ></button>
          </div>
          <div className="modal-body">
            <MontaForm
              hideModal={hideModal}
              rowToEdit={rowToEdit}
              refreshTable={getAllMontas}
            />
          </div>
        </div>
      </div>
    </div>

  </div>
);
};

export default CrudMonta
