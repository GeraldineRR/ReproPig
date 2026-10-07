import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DataTable from 'react-data-table-component'
import Seguimiento_CerdaForm from "./Seguimiento_CerdaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { customTableStyles } from "../../styles/tableStyles.js"


const crudSeguimiento_Cerda = () => {
    const [Seguimiento_Cerda, setSeguimiento_Cerda] = useState([])
    const [Seguimiento_CerdaEdit, setSeguimiento_CerdaEdit] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [cerdaFiltro, setCerdaFiltro] = useState("")
    const [cerdasList, setCerdasList] = useState([])
    const [modalKey, setModalKey] = useState(0)
    const { id: porcinoIdParams } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (porcinoIdParams) {
            setCerdaFiltro(porcinoIdParams)
        }
    }, [porcinoIdParams])

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Seguimiento_Cerda, width: '70px' },
        { name: 'Fecha', selector: row => row.Fecha ? row.Fecha.split('T')[0] : '—' },
        { name: 'Hora', selector: row => row.Hora || '—' },
        { name: 'Cerda', selector: row => <span className="fw-bold text-primary">{row.porcino?.Nom_Porcino || `Cerda #${row.Id_Porcino}`}</span>, sortable: true },
        { name: 'Id Ciclo', selector: row => row.Id_Ciclo || '—' },
        { name: 'Responsable', selector: row => row.Responsables?.Nombres || '—' },
        { name: 'Medicamento', selector: row => row.medicamentos?.Nombre || '—' },
        { name: 'Observaciones', selector: row => row.Observaciones || '—', wrap: true },
        {
            name: 'Acciones', cell: row => (
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" onClick={() => handleEdit(row)}>
                    <i className="fa-solid fa-pencil text-xs"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllSeguimiento_Cerda()
        getCerdas()
    }, [])

    const getAllSeguimiento_Cerda = async () => {
        try {
            const response = await apiAxios.get('/Seguimiento_Cerda/')
            setSeguimiento_Cerda(response.data)
        } catch (e) {
            console.error("Error al obtener seguimiento de cerda:", e)
        }
    }

    const getCerdas = async () => {
        try {
            const res = await apiAxios.get('/porcino/')
            // Filtrar cerdas adultas
            const hembras = res.data.filter(p => p.Gen_Porcino === 'H' || p.Tipo_Cerdo === 'Adulto')
            setCerdasList(hembras)
        } catch (e) {
            console.error("Error al obtener cerdas:", e)
        }
    }

    const newListSeguimiento_Cerda = Seguimiento_Cerda.filter(row => {
        const textToSearch = filterText.toLowerCase()
        const Id = String(row.Id_Seguimiento_Cerda || '').toLowerCase()
        const Fecha = String(row.Fecha || '').toLowerCase()
        const Cerda = String(row.porcino?.Nom_Porcino || '').toLowerCase()
        const Obs = String(row.Observaciones || '').toLowerCase()

        const matchesText = (
            Id.includes(textToSearch) ||
            Fecha.includes(textToSearch) ||
            Cerda.includes(textToSearch) ||
            Obs.includes(textToSearch)
        )

        let matchesCerda = true
        const targetCerda = cerdaFiltro || porcinoIdParams
        if (targetCerda) {
            matchesCerda = String(row.Id_Porcino) === String(targetCerda)
        }

        return matchesText && matchesCerda
    })

    const hideModal = () => {
        setSeguimiento_CerdaEdit(null)
        setModalKey(prev => prev + 1)
        document.getElementById('closeModal').click()
        getAllSeguimiento_Cerda()
    }

    const handleEdit = (Seguimiento_Cerda) => {
        setSeguimiento_CerdaEdit(Seguimiento_Cerda)
        setModalKey(prev => prev + 1)
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const handleNuevo = () => {
        setSeguimiento_CerdaEdit(null)
        setModalKey(prev => prev + 1)
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const cerdaSeleccionadaObj = cerdasList.find(c => String(c.Id_Porcino) === String(cerdaFiltro || porcinoIdParams))

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex mb-3 justify-content-between align-items-center">
                    <div className="col-8 d-flex gap-2 align-items-center">
                        {(porcinoIdParams || cerdaFiltro) && (
                            <button className="btn btn-secondary" onClick={() => { setCerdaFiltro(''); navigate('/seguimiento_cerda') }} title="Mostrar todas las cerdas">
                                <i className="fa-solid fa-arrow-left me-1"></i> Ver Todas
                            </button>
                        )}
                        <div className="input-group" style={{ maxWidth: '280px' }}>
                            <span className="input-group-text">🔍</span>
                            <input
                                className="form-control"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar en observaciones..."
                            />
                        </div>
                        <select
                            className="form-select"
                            style={{ maxWidth: '260px' }}
                            value={cerdaFiltro}
                            onChange={(e) => setCerdaFiltro(e.target.value)}
                        >
                            <option value="">🐖 Todas las Cerdas</option>
                            {cerdasList.map(c => (
                                <option key={c.Id_Porcino} value={c.Id_Porcino}>
                                    Cerda {c.Nom_Porcino} (Chapeta #{c.Num_Chapeta || c.Id_Porcino})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-4 text-end">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleNuevo}
                        >
                            + Registrar seguimiento
                        </button>
                    </div>
                </div>

                <DataTable
                    title={<h4 className="fw-bold text-gray-800 m-0 py-2">{cerdaSeleccionadaObj ? `Seguimiento de Cerda: ${cerdaSeleccionadaObj.Nom_Porcino}` : "Seguimiento Diario de Cerdas"}</h4>}
                    columns={columnsTable}
                    data={newListSeguimiento_Cerda}
                    keyField="Id_Seguimiento_Cerda"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                    customStyles={customTableStyles}
                    noDataComponent="No hay registros de seguimiento para esta cerda"
                />

                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">
                                    {Seguimiento_CerdaEdit ? "Editar Seguimiento" : "Agregar Seguimiento"}
                                </h1>
                                <button id="closeModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <Seguimiento_CerdaForm
                                    key={modalKey}
                                    hideModal={hideModal}
                                    Seguimiento_CerdaEdit={Seguimiento_CerdaEdit}
                                    reload={getAllSeguimiento_Cerda}
                                    partoIdParams={porcinoIdParams}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default crudSeguimiento_Cerda