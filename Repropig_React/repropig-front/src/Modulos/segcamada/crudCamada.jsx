import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import SegcamadaForm from "./camadaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudSegcamada = () => {

    const [segcamadas, setSegcamadas] = useState([])
    const [segcamadaEdit, setSegcamadaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')
    const [diaFiltro, setDiaFiltro] = useState(null)
    const { id: partoIdParams } = useParams()
    const navigate = useNavigate()

    const diasSeguimiento = [1, 3, 5, 7, 10, 14, 21, 28];

    const columnsTable = [
        {
            name: 'Seguimiento Crias',
            selector: row => `Cría #${row.crias?.Num_Cria ?? '—'} — Día ${row.Dia_Programado}`
        },

        {
            name: 'Fecha Programada',
            selector: row => {
                try {
                    const fecFin = row.crias?.partos?.Fec_fin;
                    const dia = row.Dia_Programado;

                    if (!fecFin || !dia) return '—';

                    const [year, month, dayStr] = fecFin.split('-');
                    const day = parseInt(dayStr, 10);
                    if (isNaN(day)) return '—';

                    const fecha = new Date(year, month - 1, day + (dia - 1));
                    if (isNaN(fecha.getTime())) return '—';

                    return fecha.toISOString().split('T')[0].split('-').reverse().join('/');
                } catch (e) {
                    return '—';
                }
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
            cell: row => {
                const hasNewer = segcamadas.some(item =>
                    item.Id_Cria === row.Id_Cria &&
                    item.Dia_Programado > row.Dia_Programado
                );

                return (
                    <span title={hasNewer ? "No se puede editar, existe un seguimiento posterior para esta cría" : "Editar"}>
                        <button
                            className={`btn btn-sm ${hasNewer ? 'btn-secondary' : 'bg-info'}`}
                            onClick={() => !hasNewer && handleEdit(row)}
                            disabled={hasNewer}
                        >
                            <i className={`fa-solid ${hasNewer ? 'fa-lock' : 'fa-pencil'}`}></i>
                        </button>
                    </span>
                );
            }
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

        const medicamento = seg.medicamentos?.Nombre?.toLowerCase() || ''
        const observaciones = seg.Observaciones?.toLowerCase() || ''
        const numCria = seg.crias?.Num_Cria?.toString() || ''

        const matchesText = medicamento.includes(textToSearch) || observaciones.includes(textToSearch) || numCria.includes(textToSearch)

        let matchesParto = true
        if (partoIdParams) {
            matchesParto = String(seg.crias?.Id_parto) === String(partoIdParams) || String(seg.crias?.partos?.Id_parto) === String(partoIdParams);
        }

        let matchesDia = true
        if (diaFiltro !== null) {
            matchesDia = Number(seg.Dia_Programado) === diaFiltro
        }

        return matchesText && matchesParto && matchesDia
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
                                placeholder="Buscar por N° Cría, medicamento, observaciones..."
                            />
                        </div>
                    </div>

                    <div className="col-5">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold">Filtrar Día:</span>
                            <button
                                className={`btn btn-sm ${diaFiltro === null ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setDiaFiltro(null)}
                            >
                                Todos
                            </button>
                            {diasSeguimiento.map(dia => (
                                <button
                                    key={dia}
                                    className={`btn btn-sm ${diaFiltro === dia ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setDiaFiltro(dia)}
                                >
                                    {dia}
                                </button>
                            ))}
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