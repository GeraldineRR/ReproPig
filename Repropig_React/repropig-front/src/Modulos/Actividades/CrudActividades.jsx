import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { customTableStyles } from "../../styles/tableStyles.js"
import { ModalResponsables, BotonResponsables } from "../../components/ModalResponsables.jsx"
import { getListaResponsables } from "../../utils/responsablesUtils.js"
import { formatearFecha } from "../../utils/dateUtils.js"
import {
    TbListCheck,
    TbSearch,
    TbTrash
} from "react-icons/tb"

const CrudActividades = () => {
    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [filterText, setFilterText] = useState('')
    const [modalResponsablesData, setModalResponsablesData] = useState(null)

    useEffect(() => {
        getActividades()
        getMedicamentos()
        getResponsables()
    }, [])

    const getActividades = async () => {
        try {
            const res = await apiAxios.get('/actividades_camada/')
            setActividades(res.data)
        } catch (error) {
            console.error("Error al obtener actividades:", error)
        }
    }

    const getMedicamentos = async () => {
        try {
            const res = await apiAxios.get('/medicamentos/')
            setMedicamentos(res.data)
        } catch (error) {
            console.error("Error al obtener medicamentos:", error)
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(res.data)
        } catch (error) {
            console.error("Error al obtener responsables:", error)
        }
    }

    const parsearIDs = (valor) => {
        if (!valor) return []
        if (Array.isArray(valor)) return valor.map(Number)
        if (typeof valor === 'string' && valor.startsWith('[')) {
            try { return JSON.parse(valor).map(Number) } catch { return [] }
        }
        const num = Number(valor)
        return isNaN(num) ? [] : [num]
    }

    const getNombresMedicamentos = (val) => {
        const ids = parsearIDs(val)
        if (ids.length === 0) return []
        return ids.map(id => {
            const m = medicamentos.find(med => Number(med.Id_Medicamento) === Number(id))
            return m ? m.Nombre : `#${id}`
        })
    }

    const getNombresResponsables = (val) => {
        const ids = parsearIDs(val)
        if (ids.length === 0) return 'N/A'
        const nombres = ids.map(id => {
            const r = responsables.find(resp => Number(resp.Id_Responsable) === Number(id))
            return r ? `${r.Nombres} ${r.Apellidos || ''}`.trim() : `#${id}`
        })
        return nombres.join(', ')
    }

    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await apiAxios.delete(`/actividades_camada/${id}`)
                MySwal.fire('Eliminada!', 'La actividad ha sido eliminada.', 'success')
                getActividades()
            } catch (error) {
                MySwal.fire('Error', 'No se pudo eliminar', 'error')
            }
        }
    }

    const filteredActividades = actividades.filter(act => {
        const text = filterText.toLowerCase()
        const tipo = act.Tipo_Actividad?.toLowerCase() || ''
        const obs = act.Observaciones?.toLowerCase() || ''
        const lechon = act.segcamada?.porcino?.Nom_Porcino?.toLowerCase() || ''
        const idLechon = act.segcamada?.Id_Porcino?.toString() || ''
        const fecha = act.Fecha_Actividad?.toLowerCase() || ''
        const meds = getNombresMedicamentos(act.Id_Medicamento).join(' ').toLowerCase()
        const resps = getNombresResponsables(act.Id_Responsable).toLowerCase()

        return tipo.includes(text) || obs.includes(text) || lechon.includes(text) || idLechon.includes(text) || fecha.includes(text) || meds.includes(text) || resps.includes(text)
    })

    const columns = [
        {
            name: 'Lechón',
            selector: row => row.segcamada?.porcino?.Nom_Porcino || (row.segcamada?.Id_Porcino ? `#${row.segcamada.Id_Porcino}` : 'N/A'),
            sortable: true,
            minWidth: '160px',
            cell: row => {
                const nom = row.segcamada?.porcino?.Nom_Porcino || (row.segcamada?.Id_Porcino ? `#${row.segcamada.Id_Porcino}` : 'N/A');
                return (
                    <div className="flex items-center gap-2.5 py-1">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                            🐽
                        </div>
                        <span className="font-semibold text-gray-900 text-xs">
                            {nom}
                        </span>
                    </div>
                );
            }
        },
        {
            name: 'Tipo Actividad',
            selector: row => row.Tipo_Actividad,
            sortable: true,
            width: '150px',
            cell: row => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {row.Tipo_Actividad}
                </span>
            )
        },
        {
            name: 'Fecha',
            selector: row => row.Fecha_Actividad,
            sortable: true,
            width: '120px',
            cell: row => <span className="text-xs font-medium text-gray-800">{formatearFecha(row.Fecha_Actividad) || 'N/A'}</span>
        },
        {
            name: 'Medicamento(s)',
            cell: row => {
                const meds = getNombresMedicamentos(row.Id_Medicamento);
                if (!meds.length) return <span className="text-gray-400 text-xs">—</span>;
                return (
                    <div className="flex flex-wrap gap-1 py-1">
                        {meds.map((nom, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                            >
                                {nom}
                            </span>
                        ))}
                    </div>
                );
            },
            minWidth: '170px',
            wrap: true
        },
        {
            name: 'Responsables',
            minWidth: '160px',
            cell: row => {
                const lista = getListaResponsables(row.Id_Responsable, responsables);
                return (
                    <BotonResponsables
                        lista={lista}
                        theme="indigo"
                        onClick={() =>
                            setModalResponsablesData({
                                titulo: "Responsables de la Actividad",
                                subtitulo: `Actividad #${row.Id_Actividad} — ${row.Fecha_Actividad || ""}`,
                                responsables: lista,
                                theme: "indigo"
                            })
                        }
                    />
                );
            }
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
                        display: "-webkit-box",
                        WebKitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}
                    className="text-xs text-gray-600"
                    title={row.Observaciones || ""}
                >
                    {row.Observaciones || "—"}
                </div>
            ),
            wrap: true,
            minWidth: "200px",
            grow: 2
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="flex gap-1.5 items-center justify-end w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shadow-xs"
                        onClick={() => handleDelete(row.Id_Actividad)}
                        title="Eliminar Actividad"
                    >
                        <TbTrash className="w-4 h-4" />
                    </button>
                </div>
            ),
            width: '80px'
        }
    ]

    return (
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <TbListCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Registro de Actividades</h1>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {filteredActividades.length} actividades
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Historial global de actividades sanitarias y manejo de camada</p>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Listado de Actividades</h2>
                        <p className="text-xs text-gray-400">Detalle de tratamientos, vacunación y descolmillado</p>
                    </div>
                    <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Buscar por lechón, tipo, responsable..."
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredActividades}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    customStyles={customTableStyles}
                    noDataComponent={
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No hay actividades registradas
                        </div>
                    }
                />
            </div>

            {/* Modal de Responsables */}
            <ModalResponsables
                data={modalResponsablesData}
                onClose={() => setModalResponsablesData(null)}
            />
        </div>
    )
}

export default CrudActividades

