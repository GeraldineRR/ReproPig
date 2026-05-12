import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import CalendarioForm from "./CalendarioForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudCalendario = () => {

    const [calendario, setCalendario] = useState([])
    const [calendarioEdit, setCalendarioEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    const getAllCalendario = async () => {
        const response = await apiAxios.get('/calendario/')
        setCalendario(response.data)
    }

    useEffect(() => {
        getAllCalendario()
    }, [])

    const formatD = (dateStr) => {
        if (!dateStr) return '—';
        return dateStr.split('T')[0].split('-').reverse().join('/');
    }

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Calendario, width: '80px' },
        { name: 'Reproducción', selector: row => row.Id_Reproduccion },
        { name: 'Fecha Servicio', selector: row => formatD(row.Fecha_Servicio) },

        { name: 'RC1', selector: row => formatD(row.rc1) },
        { name: 'RC2', selector: row => formatD(row.rc2) },
        { name: 'Cambio Alimento', selector: row => formatD(row.cambio_alimento) },
        { name: 'Día 107', selector: row => formatD(row.dia_107) },
        { name: 'Parto', selector: row => formatD(row.parto) },

        { name: 'Real RC1', selector: row => formatD(row.real_rc1) },
        { name: 'Real RC2', selector: row => formatD(row.real_rc2) },
        { name: 'Real Cambio', selector: row => formatD(row.real_cambio_alimento) },
        { name: 'Real 107', selector: row => formatD(row.real_dia_107) },
        { name: 'Real Parto', selector: row => formatD(row.real_parto) },
    ]

    const filtered = calendario.filter(item => {
        const text = filterText.toLowerCase()

        return (
            item.Id_Calendario?.toString().includes(text) ||
            item.Fecha_Servicio?.toLowerCase().includes(text)
        )
    })

    const handleEdit = (item) => {
        setCalendarioEdit(item)

        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )

        modal.show()
    }

    const handleNuevo = () => {
        setCalendarioEdit(null)

        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )

        modal.show()
    }

    const hideModal = () => {
        setCalendarioEdit(null)
        document.getElementById('closeModal').click()
        getAllCalendario()
    }

    return (
        <div className="container mt-5">

            <div className="row d-flex justify-content-between">
                <div className="col-4">
                    <input
                        className="form-control"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        placeholder="🔍 Buscar..."
                    />
                </div>

                <div className="col-2">
                    <button className="btn btn-primary" onClick={handleNuevo}>
                        Nuevo
                    </button>
                </div>
            </div>

            <DataTable
                title="Calendario"
                columns={columnsTable}
                data={filtered}
                pagination
                highlightOnHover
                striped
            />

            <div className="modal fade" id="exampleModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                {calendarioEdit ? "Editar Calendario" : "Nuevo Calendario"}
                            </h5>

                            <button
                                id="closeModal"
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            />
                        </div>

                        <div className="modal-body">
                            <CalendarioForm
                                key={calendarioEdit?.Id_Calendario || "new"}
                                calendarioEdit={calendarioEdit}
                                hideModal={hideModal}
                                reload={getAllCalendario}
                            />
                        </div>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default CrudCalendario