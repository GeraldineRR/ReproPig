import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import CalendarioForm from "../Calendario/CalendarioForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudCalendario = () => {

    const [calendario, setCalendario] = useState([])
    const [calendarioEdit, setCalendarioEdit] = useState(null)
    const [cicloData, setCicloData] = useState(null)
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
        { name: 'Id', selector: row => row.Id_Calendario, width: '70px', sortable: true },
        { name: 'Ciclo', selector: row => row.Id_Ciclo, width: '80px', sortable: true },
        {
            name: 'Cerda',
            selector: row => row.ciclo?.porcino?.Nom_Porcino || `Cerda #${row.ciclo?.Id_Cerda || '—'}`,
            sortable: true
        },
        { name: 'Fecha Servicio', selector: row => formatD(row.Fecha_Servicio), sortable: true },
        { name: 'RC1', selector: row => formatD(row.rc1) },
        { name: 'RC2', selector: row => formatD(row.rc2) },
        { name: 'Cambio Alimento', selector: row => formatD(row.cambio_alimento) },
        { name: 'Día 107', selector: row => formatD(row.dia_107) },
        { name: 'Parto', selector: row => formatD(row.parto) },
        {
            name: 'Acciones',
            cell: row => (
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
                    Ver / Editar
                </button>
            ),
            width: '120px'
        }
    ]

    const filtered = calendario.filter(item => {
        const text = filterText.toLowerCase()
        return (
            item.Id_Calendario?.toString().includes(text) ||
            item.Id_Ciclo?.toString().includes(text) ||
            item.Fecha_Servicio?.toLowerCase().includes(text) ||
            item.ciclo?.porcino?.Nom_Porcino?.toLowerCase().includes(text)
        )
    })

    // Construir cicloData desde el registro del calendario
    const buildCicloData = (item) => ({
        Id_Ciclo: item.Id_Ciclo,
        TipoCiclo: item.ciclo?.TipoCiclo || 'Monta',
        activo: item.ciclo?.activo ?? 'S',
        nombreCerda: item.ciclo?.porcino?.Nom_Porcino || `Cerda #${item.ciclo?.Id_Cerda || ''}`,
        fechaServicio: item.Fecha_Servicio,
    })

    const handleEdit = (item) => {
        setCalendarioEdit(item)
        setCicloData(buildCicloData(item))

        const modal = new bootstrap.Modal(
            document.getElementById('calendarioModal')
        )
        modal.show()
    }

    const handleNuevo = () => {
        setCalendarioEdit(null)
        setCicloData(null)

        const modal = new bootstrap.Modal(
            document.getElementById('calendarioModal')
        )
        modal.show()
    }

    const hideModal = () => {
        setCalendarioEdit(null)
        setCicloData(null)
        document.getElementById('closeModal').click()
        getAllCalendario()
    }

    return (
        <div className="container mt-5">

            <div className="row d-flex justify-content-between mb-3">
                <div className="col-5">
                    <input
                        className="form-control"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        placeholder="🔍 Buscar por ciclo, cerda o fecha..."
                    />
                </div>

                <div className="col-2 text-end">
                    <button className="btn btn-primary" onClick={handleNuevo}>
                        Nuevo
                    </button>
                </div>
            </div>

            <DataTable
                title="Calendarios Reproductivos"
                columns={columnsTable}
                data={filtered}
                pagination
                highlightOnHover
                striped
                noDataComponent="No hay calendarios registrados"
            />

            <div className="modal fade" id="calendarioModal" tabIndex="-1">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                {calendarioEdit ? `Calendario — Ciclo #${calendarioEdit.Id_Ciclo}` : "Nuevo Calendario"}
                            </h5>

                            <button
                                id="closeModal"
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            />
                        </div>

                        <div className="modal-body p-0">
                            <CalendarioForm
                                key={calendarioEdit?.Id_Calendario || "new"}
                                calendarioEdit={calendarioEdit}
                                cicloData={cicloData}
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