import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig"
import DataTable from 'react-data-table-component'
import { customTableStyles } from "../../styles/tableStyles.js"
import CiclosForm from "./CiclosForm.jsx"
import MontaForm from "../montas/montaForm.jsx"
import InseminacionForm from "../inseminaciones/inseminacionForm.jsx"
import ColectaForm from "../colectas/colectaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from "sweetalert2"
import WithReactContent from "sweetalert2-react-content"
import CalendarioForm from "../calendario/CalendarioForm.jsx"


const CrudCiclos = () => {

    const MySwal = WithReactContent(Swal)
    const navigate = useNavigate()
    const [ciclos, setCiclos] = useState([])
    const [cicloEdit, setCicloEdit] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [modalEncadenado, setModalEncadenado] = useState(null)
    const [colectaParaInseminacion, setColectaParaInseminacion] = useState(null)
    const [calendarioData, setCalendarioData] = useState(null)
    const [calendarioEdit, setCalendarioEdit] = useState(null)
    const [calendarioIsInactive, setCalendarioIsInactive] = useState(false)

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

    const getAllCiclos = async () => {
        try {
            const response = await apiAxios.get('/ciclos/')
            setCiclos(response.data)
        } catch (error) {
            console.error('Error al obtener ciclos:', error)
        }
    }

    useEffect(() => {
        getAllCiclos()
    }, [])

    const cleanId = (id) => String(id || '').replace(/^:+/, '')

    const handleDelete = async (row) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el ciclo #${row.Id_Ciclo} y todas sus montas e inseminaciones.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })
        if (result.isConfirmed) {
            try {
                const sanitizedId = cleanId(row.Id_Ciclo)
                if (!sanitizedId) throw new Error('Id de ciclo inválido')
                await apiAxios.delete('/ciclos/' + sanitizedId)
                MySwal.fire({ icon: 'success', title: 'Eliminado', text: 'Ciclo eliminado correctamente' })
                getAllCiclos()
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
            }
        }
    }

    // ========================
    // CALENDARIO
    // ========================
    const handleAgregarCalendario = async (row) => {
        const isActivo = (row.activo || row.Activo || '').toUpperCase() === 'S';
        setCalendarioIsInactive(!isActivo)

        const todasFechas = [
            ...((row.montas || []).map(m => m.Fec_hora).filter(Boolean)),
            ...((row.inseminaciones || []).map(i => i.Fec_hora).filter(Boolean))
        ]
        const fecha = todasFechas.length
            ? todasFechas.sort()[0].split('T')[0]
            : ''

        const sanitizedId = cleanId(row.Id_Ciclo)
        if (!sanitizedId) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Id de ciclo inválido para calendario' })
            return
        }

        // Determinar tipo de ciclo
        const tieneMontas = row.montas?.length > 0
        const tieneInseminaciones = row.inseminaciones?.length > 0
        let tipoCiclo = row.TipoCiclo || 'Monta'
        if (tieneMontas && tieneInseminaciones) tipoCiclo = 'Monta e Inseminación'
        else if (tieneMontas) tipoCiclo = 'Monta'
        else if (tieneInseminaciones) tipoCiclo = 'Inseminacion'

        // Construir cicloData con los datos del row (siempre disponible)
        const cicloInfo = {
            Id_Ciclo: sanitizedId,
            TipoCiclo: tipoCiclo,
            activo: row.activo || row.Activo || 'S',
            nombreCerda: row.porcino?.Nom_Porcino || `Cerda #${row.Id_Cerda || ''}`,
            fechaServicio: fecha,
        }

        // ✅ Verificar si ya existe un calendario para este ciclo
        try {
            const calRes = await apiAxios.get(`/calendario/ciclo/${sanitizedId}`)
            if (calRes.data) {
                // Ya existe → abrir en modo edición para actualizar fechas reales
                setCalendarioEdit(calRes.data)
                setCalendarioData(cicloInfo)
            } else {
                // No existe → abrir en modo creación
                setCalendarioEdit(null)
                setCalendarioData(cicloInfo)
            }
        } catch (error) {
            // Si hay error, abrir en modo creación por defecto
            setCalendarioEdit(null)
            setCalendarioData(cicloInfo)
        }

        abrirModal(modalCalendarioRef, modalCalendarioInstanceRef)
    }

    const hideModalCalendario = async () => {
        setCalendarioData(null)
        setCalendarioEdit(null)
        cerrarModal(modalCalendarioInstanceRef)
        await getAllCiclos()
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

    const handleEdit = (ciclo) => {
        setCicloEdit(ciclo)
        abrirModal(modalRef, modalInstanceRef)
    }

    const handleNew = () => {
        setCicloEdit(null)
        abrirModal(modalRef, modalInstanceRef)
    }

    const hideModal = async () => {
        setCicloEdit(null)
        cerrarModal(modalInstanceRef)
        await getAllCiclos()
    }

    const handleToggleActivo = async (row) => {
        const isActivo = (row.activo || row.Activo || '').toUpperCase() === 'S';
        const accion = isActivo ? 'inactivar' : 'activar'
        const result = await MySwal.fire({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} ciclo?`,
            text: `El ciclo #${row.Id_Ciclo} de la cerda "${row.porcino?.Nom_Porcino}" será ${accion === 'activar' ? 'activado' : 'inactivado'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: accion === 'activar' ? '#28a745' : '#ffc107',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        })
        if (result.isConfirmed) {
            try {
                const sanitizedId = cleanId(row.Id_Ciclo)
                if (!sanitizedId) throw new Error('Id de ciclo inválido')
                await apiAxios.patch(`/ciclos/${sanitizedId}/toggle-activo`)
                MySwal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: `Ciclo ${accion === 'activar' ? 'activado' : 'inactivado'} correctamente`,
                    timer: 1500,
                    showConfirmButton: false
                })
                getAllCiclos()
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
            }
        }
    }

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Ciclo, sortable: true, width: '60px' },
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || 'Sin nombre', sortable: true },
        {
            name: 'Tipo', selector: row => {
                const tieneMontas = row.montas?.length > 0
                const tieneInseminaciones = row.inseminaciones?.length > 0
                if (tieneMontas && tieneInseminaciones) return 'Monta e Inseminación'
                if (tieneMontas) return 'Monta'
                if (tieneInseminaciones) return 'Inseminacion'
                return row.TipoCiclo
            }
        },
        {
            name: 'Activo',
            width: '110px',
            cell: row => {
                const isActivo = (row.activo || row.Activo || '').toUpperCase() === 'S';
                return (
                    <span
                        className={`badge ${isActivo ? 'bg-success' : 'bg-secondary'}`}
                        style={{ cursor: 'pointer', fontSize: '12px' }}
                        title={isActivo ? 'Clic para inactivar' : 'Clic para activar'}
                        onClick={() => handleToggleActivo(row)}
                    >
                        {isActivo ? '✅ Activo' : '⛔ Inactivo'}
                    </span>
                );
            }
        },
        {
            name: 'Montas',
            width: '100px',
            cell: row => (
                <span
                    className="badge bg-warning text-dark"
                    style={{ cursor: 'pointer', fontSize: '13px' }}
                    title="Ver montas"
                    onClick={() => navigate('/montas', { state: { Id_Ciclo: row.Id_Ciclo, Id_Porcino: row.Id_Cerda, Nom_Porcino: row.porcino?.Nom_Porcino, Activo: row.activo || row.Activo } })}
                >
                    🐷 {row.montas?.length || 0}
                </span>
            )
        },
        {
            name: 'Inseminaciones',
            width: '140px',
            cell: row => (
                <span
                    className="badge bg-primary"
                    style={{ cursor: 'pointer', fontSize: '13px' }}
                    title="Ver inseminaciones"
                    onClick={() => navigate('/inseminaciones', { state: { Id_Ciclo: row.Id_Ciclo, Id_Porcino: row.Id_Cerda, Nom_Porcino: row.porcino?.Nom_Porcino, Activo: row.activo || row.Activo } })}
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

                    <button className="btn btn-sm btn-info" title="Editar"
                        onClick={() => handleEdit(row)}>
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    {/* <button className="btn btn-sm btn-danger" title="Eliminar"
                        onClick={() => handleDelete(row)}>
                        <i className="fa-solid fa-trash"></i>
                    </button> */}
                </div>
            )
        }
    ]

    const onCicloCreada = ({ tipo, Id_Ciclo, Id_Porcino }) => {
        setModalEncadenado({ tipo, Id_Ciclo, Id_Porcino })
        setTimeout(() => {
            if (tipo === 'Monta') abrirModal(modalMontaRef, modalMontaInstanceRef)
            else if (tipo === 'Inseminacion') abrirModal(modalInseminacionRef, modalInseminacionInstanceRef)
        }, 400)
    }

    const onColectaCreada = (Id_colecta) => {
        cerrarModal(modalColectaInstanceRef)
        setModalEncadenado({
            tipo: 'Inseminacion',
            Id_Ciclo: colectaParaInseminacion.Id_Ciclo,
            Id_Porcino: colectaParaInseminacion.Id_Porcino,
            Id_colecta
        })
        setTimeout(() => abrirModal(modalInseminacionRef, modalInseminacionInstanceRef), 400)
    }

    const hideModalMonta = async () => {
        setModalEncadenado(null)
        cerrarModal(modalMontaInstanceRef)
        await getAllCiclos()
    }

    const hideModalInseminacion = async () => {
        setModalEncadenado(null)
        cerrarModal(modalInseminacionInstanceRef)
        await getAllCiclos()
    }

    const hideModalColecta = () => {
        setColectaParaInseminacion(null)
        cerrarModal(modalColectaInstanceRef)
    }

    const filteredCiclos = ciclos.filter(rep => {
        const text = filterText.toLowerCase()
        return (
            rep.Id_Ciclo?.toString().includes(text) ||
            rep.porcino?.Nom_Porcino?.toLowerCase().includes(text) ||
            rep.TipoCiclo?.toLowerCase().includes(text)
        )
    })

    return (
        <div className="container mt-5">

            <div className="row g-2 align-items-center justify-content-between mb-3">
                <div className="col-12 col-md-8">
                    <input className="form-control" placeholder="🔍 Buscar..."
                        value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                </div>
                <div className="col-12 col-md-4">
                    <button type="button" className="btn btn-primary w-100" onClick={handleNew}>
                        Nuevo Ciclo
                    </button>
                </div>
            </div>

            <div className="table-responsive">
                <DataTable
                    title={<h4 className="fw-bold text-gray-800 m-0 py-2">Ciclos</h4>}
                    columns={columnsTable}
                    data={filteredCiclos}
                    keyField="Id_Ciclo"
                    pagination
                    responsive
                    customStyles={customTableStyles}
                    noDataComponent="No hay ciclos registradas"
                />
            </div>

            {/* Modal Ciclo */}
            <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen-sm-down">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {cicloEdit ? "Editar Ciclo" : "Nuevo Ciclo"}
                            </h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalInstanceRef)}></button>
                        </div>
                        <div className="modal-body">
                            <CiclosForm
                                key={cicloEdit ? cicloEdit.Id_Ciclo : 'new'}
                                hideModal={hideModal}
                                cicloEdit={cicloEdit}
                                onCicloCreada={onCicloCreada}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Calendario */}
            <div className="modal fade" ref={modalCalendarioRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-fullscreen-sm-down">
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
                                    cicloData={calendarioData}
                                    hideModal={hideModalCalendario}
                                    reload={getAllCiclos}
                                    isInactive={calendarioIsInactive}
                                />
                            )}
                            {!calendarioEdit && calendarioData && (
                                <CalendarioForm
                                    key={`new-${calendarioData.Id_Ciclo}`}
                                    hideModal={hideModalCalendario}
                                    reload={getAllCiclos}
                                    cicloData={calendarioData}
                                    preloaded={{
                                        Id_Ciclo: calendarioData.Id_Ciclo,
                                        Fecha_Servicio: calendarioData.fechaServicio
                                    }}
                                    isInactive={calendarioIsInactive}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Colecta encadenado */}
            <div className="modal fade" ref={modalColectaRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-fullscreen-sm-down">
                    <div className="modal-content">
                        <div className="modal-header bg-success bg-opacity-10">
                            <h5 className="modal-title">🧪 Registrar Colecta</h5>
                            <button type="button" className="btn-close"
                                onClick={hideModalColecta}></button>
                        </div>
                        <div className="modal-body">
                            {colectaParaInseminacion && (
                                <ColectaForm
                                    key={colectaParaInseminacion.Id_Ciclo}
                                    hideModal={hideModalColecta}
                                    refreshTable={getAllCiclos}
                                    onColectaCreada={onColectaCreada}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Monta encadenado */}
            <div className="modal fade" ref={modalMontaRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-fullscreen-sm-down">
                    <div className="modal-content">
                        <div className="modal-header bg-danger bg-opacity-10">
                            <h5 className="modal-title">🐷 Registrar Monta</h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalMontaInstanceRef)}></button>
                        </div>
                        <div className="modal-body">
                            {modalEncadenado?.tipo === 'Monta' && (
                                <MontaForm
                                    key={modalEncadenado.Id_Ciclo}
                                    hideModal={hideModalMonta}
                                    refreshTable={getAllCiclos}
                                    preloaded={{
                                        Id_Ciclo: modalEncadenado.Id_Ciclo,
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
                <div className="modal-dialog modal-lg modal-fullscreen-sm-down">
                    <div className="modal-content">
                        <div className="modal-header bg-primary bg-opacity-10">
                            <h5 className="modal-title">💉 Registrar Inseminación</h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalInseminacionInstanceRef)}></button>
                        </div>
                        <div className="modal-body">
                            {modalEncadenado?.tipo === 'Inseminacion' && (
                                <InseminacionForm
                                    key={modalEncadenado.Id_Ciclo}
                                    hideModal={hideModalInseminacion}
                                    refreshTable={getAllCiclos}
                                    preloaded={{
                                        Id_Ciclo: modalEncadenado.Id_Ciclo,
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

export default CrudCiclos