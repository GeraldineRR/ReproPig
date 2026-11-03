import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect, useRef } from "react"
import DataTable from 'react-data-table-component'
import CalendarioForm from "../Calendario/CalendarioForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { customTableStyles } from "../../styles/tableStyles.js"
import { useSearchParams } from "react-router-dom"
import {
    TbCalendarEvent,
    TbSearch,
    TbPlus,
    TbEye
} from "react-icons/tb"

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
        {
            name: 'ID',
            selector: row => row.Id_Calendario,
            cell: row => (
                <span className="font-mono text-xs text-gray-500 font-semibold">
                    #{row.Id_Calendario}
                </span>
            ),
            width: '75px',
            sortable: true
        },
        {
            name: 'Ciclo',
            selector: row => row.Id_Ciclo,
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Ciclo #{row.Id_Ciclo}
                </span>
            ),
            width: '95px',
            sortable: true
        },
        {
            name: 'Cerda',
            selector: row => row.ciclo?.porcino?.Nom_Porcino || `Cerda #${row.ciclo?.Id_Cerda || '—'}`,
            cell: row => (
                <div className="flex items-center gap-2 py-1">
                    <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        ♀
                    </div>
                    <span className="font-bold text-gray-800 text-xs">
                        {row.ciclo?.porcino?.Nom_Porcino || `Cerda #${row.ciclo?.Id_Cerda || '—'}`}
                    </span>
                </div>
            ),
            sortable: true,
            minWidth: '150px'
        },
        {
            name: 'F. Servicio',
            selector: row => formatD(row.Fecha_Servicio),
            cell: row => <span className="text-gray-700 text-xs">{formatD(row.Fecha_Servicio)}</span>,
            sortable: true,
            width: '110px'
        },
        {
            name: 'RC1 (21d)',
            selector: row => formatD(row.real_rc1 || row.rc1),
            cell: row => <span className="text-gray-700 text-xs">{formatD(row.real_rc1 || row.rc1)}</span>,
            width: '105px'
        },
        {
            name: 'RC2 (42d)',
            selector: row => formatD(row.real_rc2 || row.rc2),
            cell: row => <span className="text-gray-700 text-xs">{formatD(row.real_rc2 || row.rc2)}</span>,
            width: '105px'
        },
        {
            name: 'Cambio Alimento',
            selector: row => row.real_cambio_alimento || row.cambio_alimento,
            cell: row => (
                <div className="py-1">
                    <div className="text-xs text-gray-700">{formatD(row.real_cambio_alimento || row.cambio_alimento)}</div>
                    {row.resultado_cambio === 'no_realizado' ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200" title={row.observaciones_cambio || ''}>
                            No se dio
                        </span>
                    ) : row.real_cambio_alimento ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Realizado
                        </span>
                    ) : null}
                </div>
            ),
            sortable: true,
            minWidth: '130px'
        },
        {
            name: 'Día 107',
            selector: row => row.real_dia_107 || row.dia_107,
            cell: row => (
                <div className="py-1">
                    <div className="text-xs text-gray-700">{formatD(row.real_dia_107 || row.dia_107)}</div>
                    {row.resultado_107 === 'no_realizado' ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200" title={row.observaciones_107 || ''}>
                            No trasladada
                        </span>
                    ) : row.real_dia_107 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Trasladada
                        </span>
                    ) : null}
                </div>
            ),
            sortable: true,
            minWidth: '130px'
        },
        {
            name: 'Parto Estimado/Real',
            selector: row => row.real_parto || row.parto,
            cell: row => (
                <div className="py-1">
                    <div className="text-xs text-gray-700">{formatD(row.real_parto || row.parto)}</div>
                    {row.real_parto && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Parió
                        </span>
                    )}
                </div>
            ),
            sortable: true,
            minWidth: '130px'
        },
        {
            name: 'Acciones',
            cell: row => (
                <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors shadow-xs"
                    onClick={() => handleEdit(row)}
                >
                    <TbEye className="w-3.5 h-3.5" />
                    <span>Ver / Editar</span>
                </button>
            ),
            width: '130px'
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
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl shadow-inner flex-shrink-0">
                        <TbCalendarEvent className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Calendario Reproductivo</h1>
                            <span className="px-3 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                                {calendario.length} registros
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Seguimiento de etapas clave: RC1, RC2, cambio de alimento, día 107 y parto
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-md shadow-indigo-500/20 px-5 py-2.5 text-sm hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
                        onClick={handleNuevo}
                    >
                        <TbPlus className="w-5 h-5" />
                        <span>Nuevo Calendario</span>
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 tracking-tight">Programación Reproductiva</h2>
                        <p className="text-xs text-gray-500">Eventos de gestación y seguimiento veterinario</p>
                    </div>

                    <div className="relative w-full sm:w-80 md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <TbSearch className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por ciclo, cerda o fecha..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={filtered}
                        keyField="Id_Calendario"
                        pagination
                        highlightOnHover
                        pointerOnHover
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="py-12 text-center text-gray-500 font-medium">
                                No hay calendarios registrados
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Modal */}
            <div className="modal fade" id="calendarioModal" ref={modalRef} data-bs-focus="false">
                <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: '95vw', margin: '1.75rem auto' }}>
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title font-bold text-gray-800">
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