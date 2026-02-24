import apiAxios from "../api/axiosConfig"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import MedicamentosForm from "./MedicamentosForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'


const crudMedicamentos = () =>{
    const [Medicamentos, setMedicamentos] = useState([])
    const [medicamentoEdit, setmedicamentoEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    const columnsTable = [
        { name: 'Id_Medicamento', selector: row => row.Id_Medicamento},
        { name: 'Nombre', selector: row => row.Nombre},
        { name: 'Tipo', selector: row => row.Tipo},
        { name: 'Presentacion', selector: row => row.Presentacion},
        { name: 'Observaciones', selector: row => row.Observaciones},
        { name: 'Acciones', cell: row => (
        <button className="btn btn-sm bg-info" onClick={() => handleEdit(row)}><i className="fa-solid fa-pencil"></i></button>
        )
    }
]


    useEffect(()=>{

        getAllMedicamentos()
    
    }, [])


    const getAllMedicamentos = async () =>{
        const response = await apiAxios.get('/api/medicamentos/')
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
                <div className="row d-flex justify-content-between">

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



<div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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

export default crudMedicamentos