import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DataTable from 'react-data-table-component'
import Seguimiento_CerdaForm from "./Seguimiento_CerdaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'


const crudSeguimiento_Cerda = () => {
    const [Seguimiento_Cerda, setSeguimiento_Cerda] = useState([])
    const [Seguimiento_CerdaEdit, setSeguimiento_CerdaEdit] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [modalKey, setModalKey] = useState(0)  // ← AGREGADO
    const { id: partoIdParams } = useParams()
    const navigate = useNavigate()

    const calcularFechaProgramada = (fechaParto, dia) => {
        if (!fechaParto) return '';
        const [year, month, day] = fechaParto.split('T')[0].split('-');
        const fecha = new Date(year, month - 1, parseInt(day) + (dia - 1));
        return fecha.toISOString().split('T')[0];
    }

    const columnsTable = [
        { name: 'Día Seguimiento', selector: row => `Día ${row.Dia_Programado}` },
        { name: 'Fecha Programada', selector: row => calcularFechaProgramada(row.partos?.Fec_fin, row.Dia_Programado) },
        { name: 'Fecha Real', selector: row => row.Fecha_Real ? row.Fecha_Real.split('T')[0] : '—' },
        { name: 'Responsable', selector: row => row.Responsables ? `${row.Responsables.Nombres} ${row.Responsables.Apellidos || ''}` : '—' },
        { name: 'Medicamento', selector: row => row.medicamentos?.Nombre || '—' },
        { name: 'Observaciones', selector: row => row.Observaciones, wrap: true },
        {
            name: 'Acciones', cell: row => (
                <button className="btn btn-sm bg-info" onClick={() => handleEdit(row)}>
                    <i className="fa-solid fa-pencil"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllSeguimiento_Cerda()
    }, [])

    const getAllSeguimiento_Cerda = async () => {
        const response = await apiAxios.get('/Seguimiento_Cerda/')
        setSeguimiento_Cerda(response.data)
    }

    const newListSeguimiento_Cerda = Seguimiento_Cerda.filter(row => {
        const textToSearch = filterText.toLowerCase()
        const Id = row.Id_Seguimiento_Cerda.toString().toLowerCase()
        const FechaReal = row.Fecha_Real ? row.Fecha_Real.toLowerCase() : ''
        const NomCerda = row.partos?.porcino?.Nom_Porcino ? row.partos.porcino.Nom_Porcino.toLowerCase() : ''

        const matchesText = Id.includes(textToSearch) || FechaReal.includes(textToSearch) || NomCerda.includes(textToSearch)

        let matchesParto = true
        if (partoIdParams) {
            matchesParto = String(row.Id_parto) === String(partoIdParams)
        }

        return matchesText && matchesParto
    })

    const hideModal = () => {
        setSeguimiento_CerdaEdit(null)
        setModalKey(prev => prev + 1)  // ← fuerza formulario vacío
        document.getElementById('closeModal').click()
    }

    const handleEdit = (Seguimiento_Cerda) => {
        setSeguimiento_CerdaEdit(Seguimiento_Cerda)
        setModalKey(prev => prev + 1)  // ← fuerza re-render con datos
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const handleNuevo = () => {
        setSeguimiento_CerdaEdit(null)
        setModalKey(prev => prev + 1)  // ← fuerza formulario vacío
        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
            modal.show()
        }, 0)
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex mb-3 justify-content-between align-items-center">
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
                            <input
                                className="form-control"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar por Fecha Real, medicamento, observaciones..."
                            />
                        </div>
                    </div>

                    <div className="col-3 text-end">
                        <button
                            type="button"
                            className="btn btn-success"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => setSegcamadaEdit(null)}
                        >
                            + Registrar seguimiento
                        </button>
                    </div>
                </div>

                <DataTable
                    title={partoIdParams ? `Seguimiento Cerda - Parto #${partoIdParams}` : "Seguimiento Cerda"}
                    columns={columnsTable}
                    data={newListSeguimiento_Cerda}
                    keyField="Id_Seguimiento_Cerda"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
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
                                    partoIdParams={partoIdParams}
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