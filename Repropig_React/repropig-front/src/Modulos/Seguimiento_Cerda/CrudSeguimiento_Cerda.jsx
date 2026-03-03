import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import Seguimiento_CerdaForm from "./Seguimiento_CerdaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'


const crudSeguimiento_Cerda = () =>{
    const [Seguimiento_Cerda, setSeguimiento_Cerda] = useState([])
    const [Seguimiento_CerdaEdit, setSeguimiento_CerdaEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    const columnsTable = [
        { name: 'Id_Seguimiento_Cerda', selector: row => row.Id_Seguimiento_Cerda},
        { name: 'Fecha', selector: row => row.Fecha},
        { name: 'Hora', selector: row => row.Hora},
        { name: 'Observaciones', selector: row => row.Observaciones},
        { name: 'Porcino', selector: row => row.Id_Porciono },
        { name: 'Responsable', selector: row => row.Id_Responsable },
        { name: 'Acciones', cell: row => (
        <button className="btn btn-sm bg-info" onClick={() => handleEdit(row)}><i className="fa-solid fa-pencil"></i></button>
        )
    }
]


    useEffect(()=>{

        getAllSeguimiento_Cerda()
    
    }, [])


    const getAllSeguimiento_Cerda = async () =>{
        const response = await apiAxios.get('/api/Seguimiento_Cerda/')
        setSeguimiento_Cerda(response.data)
        console.log(response.data)
    }


    const newListSeguimiento_Cerda = Seguimiento_Cerda.filter(Seguimiento_Cerda => {

        const textToSearch = filterText.toLowerCase()

        const Id = Seguimiento_Cerda.Id_Seguimiento_Cerda.toString().toLowerCase()

        const Fecha= Seguimiento_Cerda.Fecha.toLowerCase()

        return(
            Id.includes(textToSearch) ||
            Fecha.includes(textToSearch)
        )

    })

    const hideModal = () => {
        setSeguimiento_CerdaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (Seguimiento_Cerda) => {
        setSeguimiento_CerdaEdit(Seguimiento_Cerda)

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
                        title= "Seguimiento Cerda"
                        columns= {columnsTable}
                        data= {newListSeguimiento_Cerda}
                        keyField= "Id_Seguimiento_Cerda"
                        pagination
                        highlightOnHover
                        striped
                />



<div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h1 className="modal-title fs-5" id="exampleModalLabel">{Seguimiento_CerdaEdit ? "Editar Seguimiento_Cerda" : "Agregar Seguimiento_Cerda"}</h1>
        <button id="closeModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <Seguimiento_CerdaForm key={Seguimiento_CerdaEdit ? Seguimiento_CerdaEdit.Id_Seguimiento_Cerda : 'new'} hideModal={hideModal} Seguimiento_CerdaEdit={Seguimiento_CerdaEdit} reload={getAllSeguimiento_Cerda}/>
      </div>
    </div>
  </div>
</div>
            </div>
        </>
    )
}

export default crudSeguimiento_Cerda