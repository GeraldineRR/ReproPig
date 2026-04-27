import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import CalendarioForm from "./CalendarioForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudCalendario = () => {
    const [calendario, setCalendario] = useState([])
    const [calendarioEdit, setCalendarioEdit] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [modalKey, setModalKey] = useState(0)

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Calendario },
        { name: 'Reproducción', selector: row => row.Id_Reproduccion },
        { name: 'Fecha Servicio', selector: row => row.Fecha_Servicio },
        { name: 'Proy. 1rcl', selector: row => row['proyectado-1rcl'] },
        { name: 'Proy. 2rcl', selector: row => row['proyectado-2rcl'] },
        { name: 'Proy. 3rcl', selector: row => row['proyectado-3rcl'] },
        { name: 'Proy. 4rcl', selector: row => row['proyectado-4rcl'] },
        { name: 'Proy. 5rcl', selector: row => row['proyectado-5rcl'] },
        { name: 'Real 1rcl', selector: row => row['real-1rcl'] ?? '—' },
        { name: 'Real 2rcl', selector: row => row['real-2rcl'] ?? '—' },
        { name: 'Real 3rcl', selector: row => row['real-3rcl'] ?? '—' },
        { name: 'Real 4rcl', selector: row => row['real-4rcl'] ?? '—' },
        { name: 'Real 5rcl', selector: row => row['real-5rcl'] ?? '—' },
        {
            name: 'Acciones', cell: row => (
                <button className="btn btn-sm bg-info" onClick={() => handleEdit(row)}>
                    <i className="fa-solid fa-pencil"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllCalendario()
    }, [])

    const getAllCalendario = async () => {
        const response = await apiAxios.get('/Calendario/')
        setCalendario(response.data)
    }

    const newListCalendario = calendario.filter(item => {
        const textToSearch = filterText.toLowerCase()
        const id = item.Id_Calendario.toString().toLowerCase()
        const fecha = item.Fecha_Servicio?.toLowerCase() ?? ''
        return (
            id.includes(textToSearch) ||
            fecha.includes(textToSearch)
        )
    })

    const hideModal = () => {
        setCalendarioEdit(null)
        setModalKey(prev => prev + 1)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (item) => {
        setCalendarioEdit(item)
        setModalKey(prev => prev + 1)
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const handleNuevo = () => {
        setCalendarioEdit(null)
        setModalKey(prev => prev + 1)
        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
            modal.show()
        }, 0)
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex justify-content-between">
                    <div className="col-4">
                        <input
                            className="form-control"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            placeholder="🔍 Buscar...."
                        />
                    </div>
                    <div className="col-2">
                        <button type="button" className="btn btn-primary" onClick={handleNuevo}>
                            Nuevo
                        </button>
                    </div>
                </div>

                <DataTable
                    title="Calendario"
                    columns={columnsTable}
                    data={newListCalendario}
                    keyField="Id_Calendario"
                    pagination
                    highlightOnHover
                    striped
                />

                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">
                                    {calendarioEdit ? "Editar Calendario" : "Agregar Calendario"}
                                </h1>
                                <button id="closeModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <CalendarioForm
                                    key={modalKey}
                                    hideModal={hideModal}
                                    calendarioEdit={calendarioEdit}
                                    reload={getAllCalendario}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CrudCalendario