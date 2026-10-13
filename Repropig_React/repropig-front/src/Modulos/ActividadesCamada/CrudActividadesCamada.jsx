import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import ActividadesCamadaForm from "./ActividadesCamadaForm.jsx"
import SubActividades from "./SubActividades.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { customTableStyles } from "../../styles/tableStyles.js"

const CrudActividadesCamada = () => {

    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [actividadEdit, setActividadEdit] = useState(null)
    const [filterText, setFilterText] = useState('')
    const [diaFiltro, setDiaFiltro] = useState(null)
    const [partosList, setPartosList] = useState([])
    const [partoFiltro, setPartoFiltro] = useState('')
    const [selectedSegCamada, setSelectedSegCamada] = useState(null)
    const [novedadPorcino, setNovedadPorcino] = useState(null)
    const [novedadForm, setNovedadForm] = useState({ Tipo_Novedad: '', Fecha_Novedad: '', Causa_Motivo: '', Observaciones: '' })
    const [responsables, setResponsables] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const { id: partoIdParams } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (partoIdParams) {
            setPartoFiltro(partoIdParams)
        }
    }, [partoIdParams])

    const diasSeguimiento = [1, 3, 5, 7, 10, 14, 21, 28];

    const toggleEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
        const accion = esActivo ? 'inactivar' : 'activar';

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} este seguimiento de camada?`,
            text: `El seguimiento #${row.Id_SegCamada} pasará a estar ${esActivo ? 'Inactivo' : 'Activo'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/segcamada/${row.Id_SegCamada}/toggle-estado`);
                MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                getAllActividades();
            } catch (error) {
                try {
                    const nuevoEstado = esActivo ? 'Inactivo' : 'Activo';
                    await apiAxios.put(`/segcamada/${row.Id_SegCamada}`, { ...row, Estado: nuevoEstado });
                    MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                    getAllActividades();
                } catch (err) {
                    MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.' });
                }
            }
        }
    };

    const columnsTable = [
        {
            name: 'Lechón',
            selector: row => row.porcino?.Nom_Porcino || `Lechón #${row.Id_Porcino}`,
            sortable: true
        },
        {
            name: 'Cerda / Camada',
            selector: row => row.porcino?.parto?.porcino?.Nom_Porcino || row.porcino?.Nom_Porcino?.replace(/Lechón #\d+ /, '') || '—',
            cell: row => (
                <span className="fw-bold text-success">
                    {row.porcino?.parto?.porcino?.Nom_Porcino || row.porcino?.Nom_Porcino?.replace(/Lechón #\d+ /, '')}
                </span>
            ),
            sortable: true
        },
        {
            name: 'Día',
            selector: row => `Día ${row.Dia_Programado}`,
            sortable: true,
            width: '90px'
        },
        {
            name: 'Fecha Programada',
            selector: row => {
                try {
                    const fecFin = row.porcino?.parto?.Fec_fin;
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
            name: 'Peso Lechón (kg)',
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
                return (<span className={`badge ${clase}`}>{icono} {peso} kg</span>)
            }
        },
        {
            name: 'Responsables',
            cell: row => {
                const nombres = getResponsablesNames(row.Id_Responsable)

                if (!nombres.length) {
                    return <span className="text-muted">—</span>
                }

                return (
                    <div
                        className="d-flex flex-column gap-1 py-1"
                        style={{
                            width: '100%',
                            whiteSpace: 'normal'
                        }}
                    >
                        {nombres.map((nombre, index) => (
                            <span
                                key={index}
                                className="text-dark"
                                style={{
                                    fontSize: '0.8rem',
                                    lineHeight: '1.3'
                                }}
                            >
                                {nombre}
                            </span>
                        ))}
                    </div>
                )
            },
            minWidth: '190px',
            wrap: true
        },
        {
            name: 'Medicamentos',
            cell: row => {
                const nombres = getMedicamentosNames(row.Id_Medicamento)

                if (!nombres.length) {
                    return <span className="text-muted">—</span>
                }

                return (
                    <div
                        className="d-flex flex-column gap-1 py-1"
                        style={{
                            width: '100%',
                            whiteSpace: 'normal'
                        }}
                    >
                        {nombres.map((nombre, index) => (
                            <span
                                key={index}
                                className="text-dark"
                                style={{
                                    fontSize: '0.8rem',
                                    lineHeight: '1.3'
                                }}
                            >
                                {nombre}
                            </span>
                        ))}
                    </div>
                )
            },
            minWidth: '180px',
            wrap: true
        },
        {
            name: "Observaciones",
            selector: row => row.Observaciones || "—",
            cell: row => (
                <div
                    style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        lineHeight: "1.4",
                        width: "100%",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}
                    className="small"
                    title={row.Observaciones || ""}
                >
                    {row.Observaciones || "—"}
                </div>
            ),
            wrap: true,
            minWidth: "220px",
            grow: 2
        },
        {
            name: 'Estado',
            cell: row => {
                const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
                return (
                    <button
                        className={`badge border-0 ${esActivo ? 'bg-success' : 'bg-danger'}`}
                        onClick={() => toggleEstado(row)}
                        style={{ cursor: 'pointer' }}
                    >
                        {esActivo ? 'Activo' : 'Inactivo'}
                    </button>
                );
            }
        },
        {
            name: 'Acciones',
            cell: row => {
                const hasNewer = actividades.some(item =>
                    item.Id_Porcino === row.Id_Porcino &&
                    item.Dia_Programado > row.Dia_Programado
                );
                return (
                    <div className="d-flex gap-2 flex-nowrap">
                        <span title={hasNewer ? "No se puede editar, existe un seguimiento posterior" : "Editar"}>
                            <button
                                className={`btn btn-sm ${hasNewer ? 'btn-secondary' : 'bg-info'}`}
                                onClick={() => !hasNewer && handleEdit(row)}
                                disabled={hasNewer}
                            >
                                <i className={`fa-solid ${hasNewer ? 'fa-lock' : 'fa-pencil'}`}></i>
                            </button>
                        </span>
                        <button
                            className={`btn btn-sm ${row.Estado === 'Inactivo' || row.Estado === 'I' ? 'btn-success' : 'btn-warning'}`}
                            title={row.Estado === 'Inactivo' || row.Estado === 'I' ? 'Activar' : 'Inactivar'}
                            onClick={() => toggleEstado(row)}
                        >
                            <i className={`fa-solid ${row.Estado === 'Inactivo' || row.Estado === 'I' ? 'fa-check' : 'fa-ban'}`}></i>
                        </button>
                        <button
                            className="btn btn-sm btn-primary text-white"
                            title="Ver Actividades"
                            onClick={() => handleOpenSubActividades(row)}
                        >
                            <i className="fa-solid fa-syringe"></i> Actividades
                        </button>
                        <button
                            className="btn btn-sm btn-warning text-dark d-inline-flex align-items-center gap-1"
                            title="Registrar Novedad"
                            onClick={() => handleOpenNovedad(row)}
                        >
                            <i className="fa-solid fa-triangle-exclamation"></i> Novedad
                        </button>
                    </div>
                );
            },
            minWidth: '310px'
        }
    ]

    useEffect(() => {
        getAllActividades()
        getPartos()
    }, [])

    const getAllActividades = async () => {
        try {
            const response = await apiAxios.get('/segcamada/')
            setActividades(response.data)
        } catch (e) {
            console.error("Error al obtener seguimiento de camada:", e)
        }
    }

    const getPartos = async () => {
        try {
            const response = await apiAxios.get('/partos/')
            setPartosList(response.data)
        } catch (e) {
            console.error("Error al obtener partos:", e)
        }
    }

    useEffect(() => {
        getResponsables()
        getMedicamentos()
    }, [])

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables/')
            setResponsables(response.data)
        } catch (error) {
            console.error("Error cargando responsables:", error)
        }
    }

    const getMedicamentos = async () => {
        try {
            const response = await apiAxios.get('/medicamentos/')
            setMedicamentos(response.data)
        } catch (error) {
            console.error("Error cargando medicamentos:", error)
        }
    }

    const parseIds = (valor) => {
        if (valor === null || valor === undefined || valor === '') {
            return []
        }

        if (Array.isArray(valor)) {
            return valor.map(String).filter(Boolean)
        }

        if (typeof valor === 'number') {
            return [String(valor)]
        }

        if (typeof valor === 'string') {
            const texto = valor.trim()

            if (!texto) return []

            // Si viene como JSON: ["1","2","3"]
            if (texto.startsWith('[') && texto.endsWith(']')) {
                try {
                    const parsed = JSON.parse(texto)

                    if (Array.isArray(parsed)) {
                        return parsed.map(String).filter(Boolean)
                    }
                } catch (error) {
                    console.error("Error interpretando IDs:", error)
                }
            }

            // Si viene separado por comas: 1,2,3
            if (texto.includes(',')) {
                return texto
                    .split(',')
                    .map(id => id.trim())
                    .filter(Boolean)
            }

            return [texto]
        }

        return [String(valor)]
    }

    const getResponsablesNames = (valor) => {
        const ids = parseIds(valor)

        if (!ids.length) return []

        return ids.map(id => {
            const responsable = responsables.find(
                r => String(r.Id_Responsable) === String(id)
            )

            if (!responsable) {
                return `Responsable #${id}`
            }

            return `${responsable.Nombres || ''} ${responsable.Apellidos || ''}`.trim()
        })
    }

    const getMedicamentosNames = (valor) => {
        const ids = parseIds(valor)

        if (!ids.length) return []

        return ids.map(id => {
            const medicamento = medicamentos.find(
                m => String(m.Id_Medicamento) === String(id)
            )

            if (!medicamento) {
                return `Medicamento #${id}`
            }

            return medicamento.Nombre || `Medicamento #${id}`
        })
    }

    const newListActividades = actividades.filter(act => {
        const textToSearch = filterText.toLowerCase()
        const medicamento = act.medicamentos?.Nombre?.toLowerCase() || ''
        const observaciones = act.Observaciones?.toLowerCase() || ''
        const nombre = act.porcino?.Nom_Porcino?.toLowerCase() || ''
        const cerdaNombre = act.porcino?.parto?.porcino?.Nom_Porcino?.toLowerCase() || ''
        const matchesText = medicamento.includes(textToSearch) || observaciones.includes(textToSearch) || nombre.includes(textToSearch) || cerdaNombre.includes(textToSearch)
        
        let matchesParto = true
        const targetParto = partoFiltro || partoIdParams
        if (targetParto) {
            matchesParto = String(act.porcino?.Id_parto) === String(targetParto)
        }

        let matchesDia = true
        if (diaFiltro !== null) {
            matchesDia = Number(act.Dia_Programado) === diaFiltro
        }
        return matchesText && matchesParto && matchesDia
    })

    const partoSeleccionadoObj = partosList.find(p => String(p.Id_parto) === String(partoFiltro || partoIdParams))
    const tituloTabla = partoSeleccionadoObj
        ? `Seguimiento de Camada — Cerda: ${partoSeleccionadoObj.porcino?.Nom_Porcino || `#${partoSeleccionadoObj.Id_Porcino}`} (Parto #${partoSeleccionadoObj.Id_parto})`
        : "Seguimiento de Camada"

    const handleOpenSubActividades = (row) => {
        setSelectedSegCamada(row)
        const modal = new bootstrap.Modal(document.getElementById('modalSubActividades'))
        modal.show()
    }

    const handleOpenNovedad = (row) => {
        setNovedadPorcino(row)
        setNovedadForm({ Tipo_Novedad: '', Fecha_Novedad: new Date().toISOString().split('T')[0], Causa_Motivo: '', Observaciones: '' })
        const modal = new bootstrap.Modal(document.getElementById('modalNovedadRapida'))
        modal.show()
    }

    const handleGuardarNovedad = async (e) => {
        e.preventDefault()
        try {
            await apiAxios.post('/novedades/', {
                ...novedadForm,
                Id_Porcino: novedadPorcino?.Id_Porcino
            })
            if (novedadForm.Tipo_Novedad === 'Muerte' || novedadForm.Tipo_Novedad === 'Descarte') {
                await apiAxios.put(`/porcino/${novedadPorcino?.Id_Porcino}`, { Estado: novedadForm.Tipo_Novedad === 'Muerte' ? 'Muerto' : 'Inactivo' })
            }
            document.getElementById('closeModalNovedadRapida').click()
            await getAllActividades()
            MySwal.fire({ icon: 'success', title: 'Novedad registrada', timer: 1500, showConfirmButton: false })
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la novedad.' })
        }
    }

    const hideModal = () => {
        setActividadEdit(null)
        document.getElementById('closeModalActividades').click()
        getAllActividades()
    }

    const handleEdit = (actividad) => {
        setActividadEdit(actividad)

        const modal = new bootstrap.Modal(
            document.getElementById('modalActividadesCamada')
        )
        modal.show()
    }

    return (
        <>
            <div className="container mt-5">

                <div className="row g-2 mb-3 align-items-center justify-content-between">
                    <div className="col-12 col-lg-6 d-flex gap-2">
                        {(partoIdParams || partoFiltro) && (
                            <button className="btn btn-secondary text-nowrap" onClick={() => { setPartoFiltro(''); navigate('/actividades_camada') }} title="Mostrar todas las camadas">
                                <i className="fa-solid fa-arrow-left me-1"></i> Ver Todas
                            </button>
                        )}
                        <div className="input-group">
                            <span className="input-group-text">🔍</span>
                            <input
                                className="form-control"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar lechón, obs..."
                            />
                        </div>
                        <select
                            className="form-select"
                            style={{ maxWidth: '260px' }}
                            value={partoFiltro || partoIdParams || ''}
                            onChange={(e) => {
                                setPartoFiltro(e.target.value)
                                if (!e.target.value && partoIdParams) navigate('/actividades_camada')
                            }}
                        >
                            <option value="">🐖 Todas las Camadas / Cerdas</option>
                            {partosList.map(p => (
                                <option key={p.Id_parto} value={p.Id_parto}>
                                    Camada Cerda {p.porcino?.Nom_Porcino || `#${p.Id_Porcino}`} ({p.Fec_inicio ? p.Fec_inicio.split('T')[0] : '—'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-lg-auto">
                        <div className="d-flex align-items-center gap-1 flex-nowrap overflow-auto py-1">
                            <span className="fw-bold text-nowrap me-1">Filtrar Día:</span>
                            <button
                                className={`btn btn-sm px-2 py-1 text-nowrap ${diaFiltro === null ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setDiaFiltro(null)}
                            >
                                TODOS
                            </button>
                            {diasSeguimiento.map(dia => (
                                <button
                                    key={dia}
                                    className={`btn btn-sm px-2 py-1 ${diaFiltro === dia ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setDiaFiltro(dia)}
                                >
                                    {dia}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-12 col-lg-auto text-end">
                        <button
                            type="button"
                            className="btn btn-success text-nowrap"
                            data-bs-toggle="modal"
                            data-bs-target="#modalActividadesCamada"
                            onClick={() => setActividadEdit(null)}
                        >
                            + Registrar
                        </button>
                    </div>
                </div>

                <DataTable
                    title={<h4 className="fw-bold text-gray-800 m-0 py-2">{tituloTabla}</h4>}
                    columns={columnsTable}
                    data={newListActividades}
                    keyField="Id_SegCamada"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                    customStyles={customTableStyles}
                    noDataComponent="No hay registros para la camada o día seleccionado"
                />

                {/* Modal SubActividades */}
                <div className="modal fade" id="modalSubActividades" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Actividades de la Sesión</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeModalSubActividades"></button>
                            </div>
                            <div className="modal-body">
                                {selectedSegCamada && <SubActividades segCamada={selectedSegCamada} />}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="modal fade"
                    id="modalActividadesCamada"
                    tabIndex="-1"
                >
                    <div className="modal-dialog" style={{ maxWidth: "585px" }}>
                        <div className="modal-content">

                            <div className="modal-header">
                                <h1 className="modal-title fs-5">
                                    {actividadEdit
                                        ? "Editar Seguimiento"
                                        : "Registrar Seguimiento"}
                                </h1>

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModalActividades"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <ActividadesCamadaForm
                                    key={actividadEdit
                                        ? actividadEdit.Id_SegCamada
                                        : 'new'}
                                    hideModal={hideModal}
                                    actividadEdit={actividadEdit}
                                    reload={getAllActividades}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* Modal Novedad Rápida */}
                <div className="modal fade" id="modalNovedadRapida" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Registrar Novedad</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeModalNovedadRapida"></button>
                            </div>
                            <div className="modal-body">
                                {novedadPorcino && (
                                    <p className="text-muted mb-3">
                                        Lechón: <strong>{novedadPorcino.porcino?.Nom_Porcino || `#${novedadPorcino.Id_Porcino}`}</strong>
                                    </p>
                                )}
                                <form onSubmit={handleGuardarNovedad}>
                                    <div className="mb-3">
                                        <label className="form-label">Tipo de Novedad</label>
                                        <select className="form-control" required value={novedadForm.Tipo_Novedad} onChange={e => setNovedadForm({ ...novedadForm, Tipo_Novedad: e.target.value })}>
                                            <option value="">Selecciona...</option>
                                            <option value="Muerte">Muerte</option>
                                            <option value="Descarte">Descarte</option>
                                            <option value="Enfermedad">Enfermedad</option>
                                            <option value="Lesión">Lesión</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Fecha</label>
                                        <input type="date" className="form-control" required value={novedadForm.Fecha_Novedad} onChange={e => setNovedadForm({ ...novedadForm, Fecha_Novedad: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Causa / Motivo</label>
                                        <input type="text" className="form-control" value={novedadForm.Causa_Motivo} onChange={e => setNovedadForm({ ...novedadForm, Causa_Motivo: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Observaciones</label>
                                        <textarea className="form-control" rows="2" value={novedadForm.Observaciones} onChange={e => setNovedadForm({ ...novedadForm, Observaciones: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-danger">Guardar Novedad</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudActividadesCamada
