import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import CriaForm from "./CriaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudCrias = () => {

    const [crias, setCrias] = useState([])
    const [criaEdit, setCriaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')
    const { id: partoIdParams } = useParams()
    const navigate = useNavigate()

    const columnsTable = [
        { name: 'ID Parto', selector: row => row.Id_parto },

        { name: 'N° Cría', selector: row => row.Num_Cria },

        {
            name: 'Sexo',
            selector: row => {
                const sexo = row.Sexo?.trim().toLowerCase()

                if (sexo === 'm') {
                    return (
                        <span>
                            <i className="fa-solid fa-mars text-primary me-1"></i> Macho
                        </span>
                    )
                }

                if (sexo === 'h') {
                    return (
                        <span>
                            <i className="fa-solid fa-venus text-danger me-1"></i> Hembra
                        </span>
                    )
                }

                return 'N/A'
            }
        },

        {
            name: 'Estado',
            selector: row => (
                <span className={`badge ${row.Estado === 'Vivo' ? 'bg-success' : 'bg-danger'
                    }`}>
                    {row.Estado}
                </span>
            )
        },

        { name: 'Causa Muerte', selector: row => row.Causa_Muerte || '—' },

        {
            name: 'Fecha Muerte',
            selector: row => row.Fecha_Muerte ? row.Fecha_Muerte.split('T')[0] : '—'
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
        getAllCrias()
    }, [])

    const getAllCrias = async () => {
        try {
            const response = await apiAxios.get('/cria/')
            setCrias(response.data)
        } catch (error) {
            console.error("Error cargando crías:", error)
        }
    }

    const newListCrias = crias.filter(cria => {

        const text = filterText.toLowerCase()

        const parto = cria.Id_parto?.toString().toLowerCase() || ''

        const estado = cria.Estado?.toLowerCase() || ''

        const sexoBase = cria.Sexo?.trim().toLowerCase()
        let sexo = ''
        if (sexoBase === 'm') sexo = 'macho'
        else if (sexoBase === 'h') sexo = 'hembra'

        const matchesText = estado.includes(text) || parto.includes(text) || sexo.includes(text)

        if (partoIdParams) {
            return cria.Id_parto?.toString() === partoIdParams && matchesText
        }

        return matchesText
    })

    const hideModal = () => {
        setCriaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (cria) => {
        setCriaEdit(cria)

        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    return (
        <>
            <div className="container mt-5">

                <div className="row d-flex mb-3 justify-content-between">

                    <div className="col-4 d-flex gap-2">
                        {partoIdParams && (
                            <button className="btn btn-secondary" onClick={() => navigate('/partos')} title="Volver a Partos">
                                <i className="fa-solid fa-arrow-left"></i>
                            </button>
                        )}
                        <div className="input-group">
                            <span className="input-group-text">
                                🔍
                            </span>
                            <input className="form-control" value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="Buscar por parto, sexo o estado..." />
                        </div>
                    </div>

                    <div className="col-2">
                        <button
                            type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setCriaEdit(null)}
                        >
                            + Registrar cría
                        </button>
                    </div>

                </div>

                <DataTable
                    title="Crías"
                    columns={columnsTable}
                    data={newListCrias}
                    keyField="Id_Cria"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                />

                <div className="modal fade" id="exampleModal" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title"> {criaEdit ? "Editar Cría" : "Agregar Cría"} </h5>

                                <button
                                    type="button" className="btn-close" data-bs-dismiss="modal" id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <CriaForm key={criaEdit ? criaEdit.Id_Cria : 'new'} hideModal={hideModal} criaEdit={criaEdit} reload={getAllCrias}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudCrias