import { useState, useEffect, useRef } from "react"
import apiAxios from "../../api/axiosConfig"
import DataTable from 'react-data-table-component'
import ReproduccionesForm from "./ReproduccionesForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudReproducciones = () => {

    const [reproducciones, setReproducciones] = useState([])
    const [reproduccionEdit, setReproduccionEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    const modalRef = useRef(null)
    const modalInstanceRef = useRef(null)

    // Obtener todas las reproducciones
    const getAllReproducciones = async () => {
        try {
            const response = await apiAxios.get('/api/reproducciones/')
            setReproducciones(response.data)
        } catch (error) {
            console.error('Error al obtener reproducciones:', error)
        }
    }

    useEffect(() => {
        getAllReproducciones()
    }, [])

    // Columnas para la tabla
    const columnsTable = [
        { name: 'Id_Reproduccion', selector: row => row.Id_Reproduccion, sortable: true },
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || 'Sin nombre', sortable: true },
        { name: 'Activo', selector: row => row.Activo, sortable: true },
        {
            name: 'Acciones', cell: row => (
                <button
                    className="btn btn-sm bg-info me-2"
                    onClick={() => handleEdit(row)}
                >
                    <i className="fa-solid fa-pencil"></i>
                </button>
            )
        }
    ]

    // Editar
    const handleEdit = (reproduccion) => {
        setReproduccionEdit(reproduccion)
        if (!modalInstanceRef.current) {
            modalInstanceRef.current = new bootstrap.Modal(modalRef.current)
        }
        modalInstanceRef.current.show()
    }

    // Nuevo
    const handleNew = () => {
        setReproduccionEdit(null)
        if (!modalInstanceRef.current) {
            modalInstanceRef.current = new bootstrap.Modal(modalRef.current)
        }
        modalInstanceRef.current.show()
    }

    // Cerrar modal y recargar tabla
    const hideModal = async () => {
        setReproduccionEdit(null)
        modalInstanceRef.current?.hide()
        await getAllReproducciones()
    }

    // Filtrar tabla
    const filteredReproducciones = reproducciones.filter(rep => {
        const text = filterText.toLowerCase()
        return (
            rep.Id_Reproduccion?.toString().includes(text) ||
            rep.Id_Cerda?.toString().toLowerCase().includes(text)
        )
    })

    return (
        <div className="container mt-5">

            {/* Filtro y botón nuevo */}
            <div className="row d-flex justify-content-between mb-3">
                <div className="col-4">
                    <input
                        className="form-control"
                        placeholder="🔍 Buscar..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>

                <div className="col-2">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNew}
                    >
                        Nuevo
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <DataTable
                title="Reproducciones"
                columns={columnsTable}
                data={filteredReproducciones}
                keyField="Id_Reproduccion"
                pagination
                highlightOnHover
                striped
                noDataComponent="No hay reproducciones registradas"
            />

            {/* Modal */}
            <div
                className="modal fade"
                ref={modalRef}
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                {reproduccionEdit ? "Editar Reproducción" : "Agregar Reproducción"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => modalInstanceRef.current?.hide()}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <ReproduccionesForm
                                key={reproduccionEdit ? reproduccionEdit.Id_Reproduccion : 'new'}
                                hideModal={hideModal}
                                reproduccionEdit={reproduccionEdit}
                            />
                        </div>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default CrudReproducciones