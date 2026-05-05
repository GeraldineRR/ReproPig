import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig"
import DataTable from 'react-data-table-component'
import ReproduccionesForm from "./ReproduccionesForm.jsx"
import MontaForm from "../montas/montaForm.jsx"
import InseminacionForm from "../inseminaciones/inseminacionForm.jsx"
import ColectaForm from "../colectas/colectaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from "sweetalert2"
import WithReactContent from "sweetalert2-react-content"
import CalendarioForm from "../calendario/CalendarioForm.jsx"


const CrudReproducciones = () => {

    const MySwal = WithReactContent(Swal)
    const navigate = useNavigate()
    const [reproducciones, setReproducciones] = useState([])
    const [reproduccionEdit, setReproduccionEdit] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [modalEncadenado, setModalEncadenado] = useState(null)
    const [colectaParaInseminacion, setColectaParaInseminacion] = useState(null)
    const [calendarioData, setCalendarioData] = useState(null)
    const [calendarioEdit, setCalendarioEdit] = useState(null)

    const modalCalendarioRef = useRef(null)
    const modalCalendarioInstanceRef = useRef(null)

    const modalRef = useRef(null)
    const modalInstanceRef = useRef(null)

    const modalMontaRef = useRef(null)
    const modalMontaInstanceRef = useRef(null)

    const modalInseminacionRef = useRef(null)
    const modalInseminacionInstanceRef = useRef(null)

    const modalColectaRef = useRef(null)
    const modalColectaInstanceRef = useRef(null)

    const getAllReproducciones = async () => {
        try {
            const response = await apiAxios.get('/reproducciones/')
            setReproducciones(response.data)
        } catch (error) {
            console.error('Error al obtener reproducciones:', error)
        }
    }

    useEffect(() => {
        getAllReproducciones()
    }, [])

    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará la reproducción #${row.Id_Reproduccion} y todas sus montas e inseminaciones.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })
        if (result.isConfirmed) {
            try {
                await apiAxios.delete('/reproducciones/' + row.Id_Reproduccion)
                MySwal.fire({ icon: 'success', title: 'Eliminado', text: 'Reproducción eliminada correctamente' })
                getAllReproducciones()
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
            }
        }
    }

    // ========================
    // CALENDARIO
    // ========================
    const handleAgregarCalendario = async (row) => {

        const todasFechas = [
            ...((row.montas || []).map(m => m.Fec_hora)),
            ...((row.inseminaciones || []).map(i => i.Fec_hora))
        ]
        const fecha = todasFechas.length
            ? todasFechas.sort()[0].split('T')[0]
            : ''

        // ✅ Verificar si ya existe un calendario para esta reproducción
        try {
            const calRes = await apiAxios.get(`/calendario/reproduccion/${row.Id_Reproduccion}`)
            if (calRes.data) {
                // Ya existe → abrir en modo edición para actualizar fechas reales
                setCalendarioEdit(calRes.data)
                setCalendarioData(null)
            } else {
                // No existe → abrir en modo creación
                setCalendarioEdit(null)
                setCalendarioData({
                    Id_Reproduccion: row.Id_Reproduccion,
                    Fecha_Servicio: fecha
                })
            }
        } catch (error) {
            // Si hay error, abrir en modo creación por defecto
            setCalendarioEdit(null)
            setCalendarioData({
                Id_Reproduccion: row.Id_Reproduccion,
                Fecha_Servicio: fecha
            })
        }

        abrirModal(modalCalendarioRef, modalCalendarioInstanceRef)
    }

    const hideModalCalendario = async () => {
        setCalendarioData(null)
        setCalendarioEdit(null)
        cerrarModal(modalCalendarioInstanceRef)
        await getAllReproducciones()
    }

    // ========================
    // MODALES
    // ========================
    const abrirModal = (ref, instanceRef) => {
        if (!instanceRef.current) {
            instanceRef.current = new bootstrap.Modal(ref.current)
        }
        instanceRef.current.show()
    }

    const cerrarModal = (instanceRef) => {
        instanceRef.current?.hide()
    }

    const handleEdit = (reproduccion) => {
        setReproduccionEdit(reproduccion)
        abrirModal(modalRef, modalInstanceRef)
    }

    const handleNew = () => {
        setReproduccionEdit(null)
        abrirModal(modalRef, modalInstanceRef)
    }

    const hideModal = async () => {
        setReproduccionEdit(null)
        cerrarModal(modalInstanceRef)
        await getAllReproducciones()
    }

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Reproduccion, sortable: true, width: '60px' },
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || 'Sin nombre', sortable: true },

        {
            name: 'Tipo',
            selector: row => {
                const tieneMontas = row.montas?.length > 0
                const tieneInseminaciones = row.inseminaciones?.length > 0
                if (tieneMontas && tieneInseminaciones) return 'Monta Y Inseminación'
                if (tieneMontas) return 'Monta'
                if (tieneInseminaciones) return 'Inseminacion'
                return row.TipoReproduccion
            }
        },

        { name: 'Activo', selector: row => row.Activo, sortable: true, width: '80px' },

        {
            name: 'Montas',
            width: '100px',
            cell: row => (
                <span
                    className="badge bg-warning text-dark"
                    style={{ cursor: 'pointer', fontSize: '13px' }}
                    onClick={() => navigate('/montas', {
                        state: {
                            Id_Reproduccion: row.Id_Reproduccion,
                            Id_Porcino: row.Id_Cerda
                        }
                    })}
                >
                    🐷 {row.montas?.length || 0}
                </span>
            )
        },

        {
            name: 'Inseminaciones',
            width: '120px',
            cell: row => (
                <span
                    className="badge bg-primary"
                    style={{ cursor: 'pointer', fontSize: '13px' }}
                    onClick={() => navigate('/inseminaciones', {
                        state: {
                            Id_Reproduccion: row.Id_Reproduccion,
                            Id_Porcino: row.Id_Cerda
                        }
                    })}
                >
                    💉 {row.inseminaciones?.length || 0}
                </span>
            )
        },

        {
            name: 'Acciones',
            width: '140px',
            cell: row => (
                <div className="d-flex gap-1 align-items-center">
                    <button
                        className="btn btn-sm btn-success"
                        title="Calendario"
                        onClick={() => handleAgregarCalendario(row)}
                    >
                        📅
                    </button>

                    <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleEdit(row)}
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>

                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row)}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ]

    const onReproduccionCreada = ({ tipo, Id_Reproduccion, Id_Porcino }) => {
        setModalEncadenado({ tipo, Id_Reproduccion, Id_Porcino })
        setTimeout(() => {
            if (tipo === 'Monta') abrirModal(modalMontaRef, modalMontaInstanceRef)
            else if (tipo === 'Inseminacion') abrirModal(modalInseminacionRef, modalInseminacionInstanceRef)
        }, 400)
    }

    const onColectaCreada = (Id_colecta) => {
        cerrarModal(modalColectaInstanceRef)
        setModalEncadenado({
            tipo: 'Inseminacion',
            Id_Reproduccion: colectaParaInseminacion.Id_Reproduccion,
            Id_Porcino: colectaParaInseminacion.Id_Porcino,
            Id_colecta
        })
        setTimeout(() => abrirModal(modalInseminacionRef, modalInseminacionInstanceRef), 400)
    }

    const hideModalMonta = async () => {
        setModalEncadenado(null)
        cerrarModal(modalMontaInstanceRef)
        await getAllReproducciones()
    }

    const hideModalInseminacion = async () => {
        setModalEncadenado(null)
        cerrarModal(modalInseminacionInstanceRef)
        await getAllReproducciones()
    }

    const hideModalColecta = () => {
        setColectaParaInseminacion(null)
        cerrarModal(modalColectaInstanceRef)
    }

    const filteredReproducciones = reproducciones.filter(rep => {
        const text = filterText.toLowerCase()
        return (
            rep.Id_Reproduccion?.toString().includes(text) ||
            rep.porcino?.Nom_Porcino?.toLowerCase().includes(text) ||
            rep.TipoReproduccion?.toLowerCase().includes(text)
        )
    })

    return (
        <div className="container mt-5">

            <div className="row d-flex justify-content-between mb-3">
                <div className="col-4">
                    <input className="form-control" placeholder="🔍 Buscar..."
                        value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                </div>
                <div className="col-2">
                    <button type="button" className="btn btn-primary" onClick={handleNew}>
                        Nueva Reproducción
                    </button>
                </div>
            </div>

            <DataTable
                title="Reproducciones"
                columns={columnsTable}
                data={filteredReproducciones}
                keyField="Id_Reproduccion"
                pagination highlightOnHover striped
                noDataComponent="No hay reproducciones registradas"
            />

            {/* Modal Reproducción */}
            <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {reproduccionEdit ? "Editar Reproducción" : "Nueva Reproducción"}
                            </h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalInstanceRef)}></button>
                        </div>
                        <div className="modal-body">
                            <ReproduccionesForm
                                key={reproduccionEdit ? reproduccionEdit.Id_Reproduccion : 'new'}
                                hideModal={hideModal}
                                reproduccionEdit={reproduccionEdit}
                                onReproduccionCreada={onReproduccionCreada}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Calendario */}
            <div className="modal fade" ref={modalCalendarioRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-info bg-opacity-10">
                            <h5 className="modal-title">
                                {calendarioEdit ? '📅 Actualizar Calendario' : '📅 Agregar Calendario'}
                            </h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalCalendarioInstanceRef)}></button>
                        </div>

                        <div className="modal-body">
                            {calendarioEdit && (
                                <CalendarioForm
                                    key={`edit-${calendarioEdit.Id_Calendario}`}
                                    calendarioEdit={calendarioEdit}
                                    hideModal={hideModalCalendario}
                                    reload={getAllReproducciones}
                                />
                            )}
                            {!calendarioEdit && calendarioData && (
                                <CalendarioForm
                                    key={`new-${calendarioData.Id_Reproduccion}`}
                                    hideModal={hideModalCalendario}
                                    reload={getAllReproducciones}
                                    preloaded={{
                                        Id_Reproduccion: calendarioData.Id_Reproduccion,
                                        Fecha_Servicio: calendarioData.Fecha_Servicio
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Colecta encadenado */}
            <div className="modal fade" ref={modalColectaRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-success bg-opacity-10">
                            <h5 className="modal-title">🧪 Registrar Colecta</h5>
                            <button type="button" className="btn-close"
                                onClick={hideModalColecta}></button>
                        </div>
                        <div className="modal-body">
                            {colectaParaInseminacion && (
                                <ColectaForm
                                    key={colectaParaInseminacion.Id_Reproduccion}
                                    hideModal={hideModalColecta}
                                    refreshTable={getAllReproducciones}
                                    onColectaCreada={onColectaCreada}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Monta encadenado */}
            <div className="modal fade" ref={modalMontaRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-danger bg-opacity-10">
                            <h5 className="modal-title">🐷 Registrar Monta</h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalMontaInstanceRef)}></button>
                        </div>
                        <div className="modal-body">
                            {modalEncadenado?.tipo === 'Monta' && (
                                <MontaForm
                                    key={modalEncadenado.Id_Reproduccion}
                                    hideModal={hideModalMonta}
                                    refreshTable={getAllReproducciones}
                                    preloaded={{
                                        Id_Reproduccion: modalEncadenado.Id_Reproduccion,
                                        Id_Porcino: modalEncadenado.Id_Porcino
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Inseminación encadenado */}
            <div className="modal fade" ref={modalInseminacionRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary bg-opacity-10">
                            <h5 className="modal-title">💉 Registrar Inseminación</h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalInseminacionInstanceRef)}></button>
                        </div>
                        <div className="modal-body">
                            {modalEncadenado?.tipo === 'Inseminacion' && (
                                <InseminacionForm
                                    key={modalEncadenado.Id_Reproduccion}
                                    hideModal={hideModalInseminacion}
                                    refreshTable={getAllReproducciones}
                                    preloaded={{
                                        Id_Reproduccion: modalEncadenado.Id_Reproduccion,
                                        Id_Porcino: modalEncadenado.Id_Porcino,
                                        Id_colecta: modalEncadenado.Id_colecta
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CrudReproducciones