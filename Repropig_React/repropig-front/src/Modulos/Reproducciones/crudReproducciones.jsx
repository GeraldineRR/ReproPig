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

const CrudReproducciones = () => {

    const MySwal = WithReactContent(Swal)
    const navigate = useNavigate()
    const [reproducciones, setReproducciones] = useState([])
    const [reproduccionEdit, setReproduccionEdit] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [modalEncadenado, setModalEncadenado] = useState(null)
    // ✅ Estado para colecta encadenada antes de inseminación
    const [colectaParaInseminacion, setColectaParaInseminacion] = useState(null)

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
            text: `Se eliminará la reproducción #${row.Id_Reproduccion} permanentemente.`,
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

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Reproduccion, sortable: true, width: '70px' },
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || 'Sin nombre', sortable: true },
        { name: 'Tipo', selector: row => row.TipoReproduccion || '—', sortable: true },
        { name: 'Activo', selector: row => row.Activo, sortable: true },
        {
            name: 'Acciones', cell: row => (
                <div className="d-flex gap-1 flex-wrap">
                    <button className="btn btn-sm btn-info"
                        onClick={() => handleEdit(row)}>
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row)}>
                        <i className="fa-solid fa-trash"></i>
                    </button>
                    {row.TipoReproduccion === 'Monta' && (
                        <button className="btn btn-sm btn-warning"
                            onClick={() => navigate('/montas')}>
                            🐷 Monta
                        </button>
                    )}
                    {row.TipoReproduccion === 'Inseminacion' && (
                        <button className="btn btn-sm btn-primary"
                            onClick={() => navigate('/inseminaciones')}>
                            💉 Inseminación
                        </button>
                    )}
                </div>
            )
        }
    ]

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

    // ✅ Cuando se crea reproducción tipo Monta → abre form Monta
    // ✅ Cuando se crea reproducción tipo Inseminacion → abre form Colecta primero
    const onReproduccionCreada = ({ tipo, Id_Reproduccion, Id_Porcino }) => {
        setModalEncadenado({ tipo, Id_Reproduccion, Id_Porcino })
        setTimeout(() => {
            if (tipo === 'Monta') abrirModal(modalMontaRef, modalMontaInstanceRef)
            else if (tipo === 'Inseminacion') abrirModal(modalInseminacionRef, modalInseminacionInstanceRef)
        }, 400)
    }

    // ✅ Cuando se guarda la colecta → abre form Inseminación con Id_colecta prellenado
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
                        Nuevo
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

            {/* ✅ Modal Colecta encadenado (antes de inseminación) */}
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
                                        Id_colecta: modalEncadenado.Id_colecta // ✅ prellenado
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