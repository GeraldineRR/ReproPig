import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import RazaForm from "./RazaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudRazas = () => {

    const [razas, setRazas] = useState([])
    const [razaEdit, setRazaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')

    const columnsTable = [
        {
            name: 'Id Raza',
            selector: row => row.Id_Raza,
            sortable: true
        },
        {
            name: 'Nombre de la Raza',
            selector: row => row.Nom_Raza,
            sortable: true
        },
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
        getAllRazas()
    }, [])

    const getAllRazas = async () => {
        const response = await apiAxios.get('/raza/')
        setRazas(response.data)
    }

    const newListRazas = razas.filter(raza => {
        return raza.Nom_Raza.toLowerCase()
            .includes(filterText.toLowerCase())
    })

    const hideModal = () => {
        setRazaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (raza) => {
        setRazaEdit(raza)

        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )
        modal.show()
    }

    return (
        <>
            <div className="container mt-5" style={{ maxWidth: "1000px" }}>

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <div className="d-flex gap-2">
                        <input
                            className="form-control"
                            style={{ width: '290px' }}
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            placeholder="🔍 Buscar raza..."
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-success"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => setRazaEdit(null)}
                        >
                            + Nueva Raza
                        </button>
                    </div>
                </div>

                <div className="container mt-5 card shadow-sm">
                            <div className="card-body px-4">
                                <DataTable
                                    title="Razas"
                                    columns={columnsTable}
                                    data={newListRazas}
                                    keyField="Id_Raza"
                                    pagination
                                    highlightOnHover
                                    pointerOnHover
                                    striped
                                />
                    </div>
                </div>

                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h1 className="modal-title fs-5">
                                    {razaEdit
                                        ? "Editar Raza"
                                        : "Agregar Raza"}
                                </h1>

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <RazaForm
                                    key={razaEdit
                                        ? razaEdit.Id_Raza
                                        : 'new'
                                    }
                                    hideModal={hideModal}
                                    razaEdit={razaEdit}
                                    reload={getAllRazas}
                                />
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudRazas