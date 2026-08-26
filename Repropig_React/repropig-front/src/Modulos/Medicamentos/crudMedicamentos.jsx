import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import MedicamentosForm from "./MedicamentosForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from 'sweetalert2'
import WithReactContent from 'sweetalert2-react-content'


const CrudMedicamentos = () =>{
    const [Medicamentos, setMedicamentos] = useState([])
    const [medicamentoEdit, setmedicamentoEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    const MySwal = WithReactContent(Swal)

    const toggleEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
        const accion = esActivo ? 'inactivar' : 'activar';

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} este medicamento?`,
            text: `El medicamento ${row.Nombre} pasará a estar ${esActivo ? 'Inactivo' : 'Activo'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/medicamentos/${row.Id_Medicamento}/toggle-estado`);
                MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                getAllMedicamentos();
            } catch (error) {
                try {
                    const nuevoEstado = esActivo ? 'Inactivo' : 'Activo';
                    await apiAxios.put(`/medicamentos/${row.Id_Medicamento}`, { ...row, Estado: nuevoEstado });
                    MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                    getAllMedicamentos();
                } catch (err) {
                    MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.' });
                }
            }
        }
    };

    const columnsTable = [
        { name: 'Id_Medicamento', selector: row => row.Id_Medicamento},
        { name: 'Nombre', selector: row => row.Nombre},
        { name: 'Tipo', selector: row => row.Tipo},
        { name: 'Presentacion', selector: row => row.Presentacion},
        { name: 'Cantidad', selector: row => row.Cantidad ?? '—'},
        { name: 'Observaciones', selector: row => row.Observaciones},
        {
            name: 'Estado',
            cell: row => {
                const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
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
        { name: 'Acciones', cell: row => (
        <button className="btn btn-sm bg-info" onClick={() => handleEdit(row)}><i className="fa-solid fa-pencil"></i></button>
        )
    }
]


    useEffect(()=>{

        getAllMedicamentos()
    
    }, [])


    const getAllMedicamentos = async () =>{
        const response = await apiAxios.get('/medicamentos')
        setMedicamentos(response.data)
        console.log(response.data)
    }


    const newListMedicamentos = Medicamentos.filter(Medicamentos => {

        const textToSearch = filterText.toLowerCase()

        const Id = Medicamentos.Id_Medicamento.toString().toLowerCase()

        const Nombre= Medicamentos.Nombre.toLowerCase()

        return(
            Id.includes(textToSearch) ||
            Nombre.includes(textToSearch)
        )

    })
    .sort((a, b) => b.Id_Medicamento - a.Id_Medicamento)

    const hideModal = () => {
        setmedicamentoEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (Medicamentos) => {
        setmedicamentoEdit(Medicamentos)

        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    return(
        <>
            <div className="container mt-5">
                <div className="row d-flex mb-3 justify-content-between">

                    <div className="col-4">
                        <input className="form-control" value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="🔍 Buscar...."/>
                    </div>
                    <div className="col-2">
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                            Nuevo
                        </button>
                    </div>
                </div>

                    <DataTable
                        title= "Medicamentos"
                        columns= {columnsTable}
                        data= {newListMedicamentos}
                        keyField= "Id_Medicamento"
                        pagination
                        highlightOnHover
                        striped
                />



<div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h1 className="modal-title fs-5" id="exampleModalLabel">{medicamentoEdit ? "Editar Medicamento" : "Agregar Medicamento"}</h1>
        <button id="closeModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <MedicamentosForm key={medicamentoEdit ? medicamentoEdit.Id_Medicamento : 'new'} hideModal={hideModal} medicamentoEdit={medicamentoEdit} reload={getAllMedicamentos}/>
      </div>
    </div>
  </div>
</div>
            </div>
        </>
    )
}

export default CrudMedicamentos