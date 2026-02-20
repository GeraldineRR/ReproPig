import apiAxios from "../api/axiosConfig"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import ReproduccionesForm from "./ReproduccionesForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const crudReproducciones = () => {

    const [Reproducciones, setReproducciones] = useState([])
    const [reproduccionEdit, setReproduccionEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    const columnsTable = [
        { name: 'Id_Reproduccion', selector: row => row.Id_Reproduccion },
        { name: 'Id_Cerda', selector: row => row.Id_Cerda },
        { name: 'Activo', selector: row => row.Activo },
        {
            name: 'Acciones',
            cell: row => (
                <button
                    className="btn btn-sm bg-info"
                    onClick={() => handleEdit(row)}
                >
                    <i className="fa-solid fa-pencil"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllReproducciones()
    }, [])

    const getAllReproducciones = async () => {
        const response = await apiAxios.get('/api/reproducciones/')
        setReproducciones(response.data)
    }

    const newListReproducciones = Reproducciones.filter(rep => {
        const text = filterText.toLowerCase()
        return (
            rep.Id_Reproduccion.toString().includes(text) ||
            rep.Id_Cerda.toLowerCase().includes(text)
        )
    })

    const hideModal = () => {
        setReproduccionEdit(null)
        const modalEl = document.getElementById('exampleModal')
        const modal = bootstrap.Modal.getInstance(modalEl)
        modal.hide()
        getAllReproducciones()
    }

    const handleEdit = (reproduccion) => {
        setReproduccionEdit(reproduccion)
        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )
        modal.show()
    }

    const handleNew = () => {
        setReproduccionEdit(null)
        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )
        modal.show()
    }

    return (
        <>
            <div className="container mt-5">

                <div className="row d-flex justify-content-between mb-3">
                    <div className="col-4">
                        <input
                            className="form-control"
                            placeholder="🔍 Buscar..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>

                    <div className="col-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleNew}
                        >
                            Nuevo
                        </button>
                    </div>
                </div>

                <DataTable
                    title="Reproducciones"
                    columns={columnsTable}
                    data={newListReproducciones}
                    keyField="Id_Reproduccion"
                    pagination
                    highlightOnHover
                    striped
                />

                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                    aria-hidden="true"
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {reproduccionEdit
                                        ? "Editar Reproducción"
                                        : "Agregar Reproducción"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <ReproduccionesForm
                                    key={reproduccionEdit
                                        ? reproduccionEdit.Id_Reproduccion
                                        : 'new'}
                                    hideModal={hideModal}
                                    reproduccionEdit={reproduccionEdit}
                                />
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default crudReproducciones
