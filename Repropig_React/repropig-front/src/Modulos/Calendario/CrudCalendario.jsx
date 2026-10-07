import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect, useRef } from "react"
import DataTable from 'react-data-table-component'
import CalendarioForm from "../Calendario/CalendarioForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { customTableStyles } from "../../styles/tableStyles.js"
import { useSearchParams } from "react-router-dom"

const CrudCalendario = () => {

    const [calendario, setCalendario] = useState([])
    const [calendarioEdit, setCalendarioEdit] = useState(null)
    const [cicloData, setCicloData] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [searchParams, setSearchParams] = useSearchParams()
    const modalRef = useRef(null)
    const bsModalRef = useRef(null)

    const getAllCalendario = async () => {
        const response = await apiAxios.get('/calendario/')
        setCalendario(response.data)
        return response.data
    }

    // Construir cicloData desde el registro del calendario
    const buildCicloData = (item) => ({
        Id_Ciclo: item.Id_Ciclo,
        TipoCiclo: item.ciclo?.TipoCiclo || 'Monta',
        Estado: item.ciclo?.Estado ?? 'Activo',
        nombreCerda: item.ciclo?.porcino?.Nom_Porcino || `Cerda #${item.ciclo?.Id_Cerda || ''}`,
        fechaServicio: item.Fecha_Servicio,
    })

    // Abrir modal del ciclo si viene en la query (?ciclo=X)
    const handleOpenCicloFromUrl = async (allData) => {
        const cicloIdParam = searchParams.get('ciclo')
        if (!cicloIdParam) return

        const item = allData.find(c => String(c.Id_Ciclo) === String(cicloIdParam))
        if (item) {
            // Limpiar el query param de la URL sin recargar
            setSearchParams({}, { replace: true })
            // Esperar un tick para que el DOM esté listo
            setTimeout(() => {
                setCalendarioEdit(item)
                setCicloData(buildCicloData(item))
                if (modalRef.current) {
                    if (!bsModalRef.current) {
                        bsModalRef.current = new bootstrap.Modal(modalRef.current)
                    }
                    bsModalRef.current.show()
                }
            }, 200)
        }
    }

    useEffect(() => {
        getAllCalendario().then(data => {
            handleOpenCicloFromUrl(data)
        })
        return () => {
            if (bsModalRef.current) {
                bsModalRef.current.hide()
            }
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
            document.body.classList.remove('modal-open')
            document.body.style.removeProperty('overflow')
            document.body.style.removeProperty('padding-right')
        }
    }, [])

    const formatD = (dateStr) => {
        if (!dateStr) return '—';
        return dateStr.split('T')[0].split('-').reverse().join('/');
    }

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Calendario, width: '70px', sortable: true },
        { name: 'Ciclo', selector: row => row.Id_Ciclo, width: '80px', sortable: true },
        {
            name: 'Cerda',
            selector: row => row.ciclo?.porcino?.Nom_Porcino || `Cerda #${row.ciclo?.Id_Cerda || '—'}`,
            sortable: true
        },
        { name: 'Fecha Servicio', selector: row => formatD(row.Fecha_Servicio), sortable: true },
        { name: 'RC1', selector: row => formatD(row.real_rc1 || row.rc1) },
        { name: 'RC2', selector: row => formatD(row.real_rc2 || row.rc2) },
        { name: 'Cambio Alimento', selector: row => formatD(row.real_cambio_alimento || row.cambio_alimento) },
        { name: 'Día 107', selector: row => formatD(row.real_dia_107 || row.dia_107) },
        {
            name: 'Parto',
            selector: row => row.real_parto || row.parto,
            cell: row => (
                <div>
                    <div>{formatD(row.real_parto || row.parto)}</div>
                    {row.real_parto && (
                        <span className="badge bg-success" style={{ fontSize: '10px' }}>Parió</span>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            name: 'Acciones',
            cell: row => (
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
                    Ver / Editar
                </button>
            ),
            width: '120px'
        }
    ]

    const filtered = calendario.filter(item => {
        const text = filterText.toLowerCase()
        return (
            item.Id_Calendario?.toString().includes(text) ||
            item.Id_Ciclo?.toString().includes(text) ||
            item.Fecha_Servicio?.toLowerCase().includes(text) ||
            item.ciclo?.porcino?.Nom_Porcino?.toLowerCase().includes(text)
        )
    })

    const getOrCreateModal = () => {
        if (!bsModalRef.current && modalRef.current) {
            bsModalRef.current = new bootstrap.Modal(modalRef.current)
        }
        return bsModalRef.current
    }

    const handleEdit = (item) => {
        setCalendarioEdit(item)
        setCicloData(buildCicloData(item))
        const modal = getOrCreateModal()
        if (modal) modal.show()
    }

    const handleNuevo = () => {
        setCalendarioEdit(null)
        setCicloData(null)
        const modal = getOrCreateModal()
        if (modal) modal.show()
    }

    const hideModal = () => {
        setCalendarioEdit(null)
        setCicloData(null)
        if (bsModalRef.current) {
            bsModalRef.current.hide()
        }
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
            document.body.classList.remove('modal-open')
            document.body.style.removeProperty('overflow')
            document.body.style.removeProperty('padding-right')
        }, 150)
        getAllCalendario()
    }

    return (
        <div className="container mt-5">

            <div className="row d-flex justify-content-between mb-3">
                <div className="col-5">
                    <input
                        className="form-control"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        placeholder="🔍 Buscar por ciclo, cerda o fecha..."
                    />
                </div>

                <div className="col-2 text-end">
                    <button className="btn btn-primary" onClick={handleNuevo}>
                        Nuevo
                    </button>
                </div>
            </div>

            <DataTable
                title={<h4 className="fw-bold text-gray-800 m-0 py-2">Calendarios Reproductivos</h4>}
                columns={columnsTable}
                data={filtered}
                pagination
                highlightOnHover
                striped
                customStyles={customTableStyles}
                noDataComponent="No hay calendarios registrados"
            />

            {/* Modal más ancho usando modal-dialog-scrollable y max-width extendido */}
            <div className="modal fade" id="calendarioModal" ref={modalRef} data-bs-focus="false">
                <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: '95vw', margin: '1.75rem auto' }}>
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                {calendarioEdit ? `Calendario — Ciclo #${calendarioEdit.Id_Ciclo}` : "Nuevo Calendario"}
                            </h5>

                            <button
                                id="closeModal"
                                type="button"
                                className="btn-close"
                                onClick={hideModal}
                            />
                        </div>

                        <div className="modal-body p-0">
                            <CalendarioForm
                                key={calendarioEdit?.Id_Calendario || "new"}
                                calendarioEdit={calendarioEdit}
                                cicloData={cicloData}
                                hideModal={hideModal}
                                reload={getAllCalendario}
                            />
                        </div>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default CrudCalendario