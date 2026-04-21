import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import SegcamadaForm from "./camadaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudSegcamada = () => {

    const [segcamadas, setSegcamadas] = useState([])
    const [segcamadaEdit, setSegcamadaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')

    const columnsTable = [
        {
            name: 'Seguimiento Crias',
            selector: row => `Cría #${row.crias?.Num_Cria ?? '—'} — Día ${row.Dia_Programado}`
        },

        {
            name: 'Fecha Programada',
            selector: row => {
                const fecFin = row.crias?.partos?.Fec_fin;
                console.log(row)
                const dia = row.Dia_Programado;

                if (!fecFin || !dia) return '—';

                const [year, month, day] = fecFin.split('-');
                const fecha = new Date(year, month - 1, parseInt(day) + (dia - 1));

                return fecha.toISOString().split('T')[0].split('-').reverse().join('/');
            }
        },

        {
            name: 'Fecha Real',
            selector: row => row.Fecha_Real?.split('T')[0]?.split('-').reverse().join('/')
        },

        {
            name: 'Peso Cría (kg)',
            selector: row => {
                const peso = row.Peso_Cria
                let clase = ''
                let icono = ''

                if (peso < 1) {
                    clase = 'bg-danger'
                    icono = '⚠'
                } else if (peso < 2) {
                    clase = 'bg-warning text-dark'
                    icono = '!'
                } else {
                    clase = 'bg-success'
                    icono = '✓'
                }

                return (
                    <span className={`badge ${clase}`}>
                        {icono} {peso} kg
                    </span>
                )
            }
        },

        {
            name: 'Medicamento',
            selector: row => row.medicamentos?.Nombre ?? '—'
        },

        {
            name: 'Observaciones',
            selector: row => row.Observaciones || '—'
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
        getAllSegcamadas()
    }, [])

    const getAllSegcamadas = async () => {
        const response = await apiAxios.get('/segcamada/')
        setSegcamadas(response.data)
    }

    const newListSegcamadas = segcamadas.filter(seg => {

        const textToSearch = filterText.toLowerCase()

        const medicamento = seg.medicamentos?.Nombre.toLowerCase()
        const observaciones = seg.Observaciones.toLowerCase()

        return (
            medicamento && medicamento.includes(textToSearch) ||
            observaciones.includes(textToSearch)

        )
    })

    const hideModal = () => {
        setSegcamadaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (segcamada) => {
        setSegcamadaEdit(segcamada)

        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )
        modal.show()
    }

    return (
        <>
            <div className="container mt-5">

                <div className="row d-flex mb-3 justify-content-between">
                    <div className="col-4">
                        <input
                            className="form-control"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            placeholder="🔍 Buscar por "
                        />
                    </div>

                    <div className="col-3">
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
                    title="Seguimiento de Camada"
                    columns={columnsTable}
                    data={newListSegcamadas}
                    keyField="Id_SegCamada"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                />

                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                >
                    <div className="modal-dialog" style={{ maxWidth: "585px" }}>

                        <div className="modal-content">

                            <div className="modal-header">
                                <h1 className="modal-title fs-5">
                                    {segcamadaEdit
                                        ? "Editar Seguimiento"
                                        : "Agregar Seguimiento"}
                                </h1>

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <SegcamadaForm
                                    key={segcamadaEdit
                                        ? segcamadaEdit.Id_SegCamada
                                        : 'new'}
                                    hideModal={hideModal}
                                    segcamadaEdit={segcamadaEdit}
                                    reload={getAllSegcamadas}
                                />
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudSegcamada