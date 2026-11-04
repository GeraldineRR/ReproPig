import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import CriaForm from "./CriaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { customTableStyles } from "../../styles/tableStyles.js"
import { formatearFecha } from "../../utils/dateUtils.js"
import {
    TbMoodKid,
    TbSearch,
    TbArrowLeft
} from "react-icons/tb"

const MySwal = withReactContent(Swal)

const CrudCrias = () => {

    const [crias, setCrias] = useState([])
    const [criaEdit, setCriaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')
    const { id: partoIdParams } = useParams()
    const navigate = useNavigate()

    const columnsTable = [
        {
            name: 'N° Cría',
            selector: row => row.Num_Cria,
            sortable: true,
            width: '110px',
            cell: row => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200/80">
                    Cría #{row.Num_Cria}
                </span>
            )
        },
        {
            name: 'Sexo',
            width: '130px',
            cell: row => (
                <select
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 focus:bg-white focus:border-pink-500 outline-none"
                    value={row.Sexo?.trim().toUpperCase()}
                    onChange={(e) => updateCriaField(row.Id_Cria, 'Sexo', e.target.value)}
                >
                    <option value="">—</option>
                    <option value="M">♂ Macho</option>
                    <option value="H">♀ Hembra</option>
                </select>
            ),
            sortable: true
        },
        {
            name: 'Estado',
            width: '110px',
            cell: row => {
                const isVivo = row.Estado === 'Vivo';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isVivo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isVivo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {row.Estado}
                    </span>
                );
            }
        },
        {
            name: 'Fecha Muerte',
            width: '130px',
            cell: row => <span className="text-xs text-gray-600">{formatearFecha(row.Fecha_Muerte) || '—'}</span>,
            sortable: true
        },
        {
            name: 'Causa Muerte',
            minWidth: '170px',
            cell: row => (
                <select
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 focus:bg-white focus:border-pink-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    value={row.Causa_Muerte || ''}
                    onChange={(e) => updateCriaField(row.Id_Cria, 'Causa_Muerte', e.target.value || null)}
                    disabled
                >
                    <option value="">—</option>
                    <option value="Nacido muerto">Nacido muerto</option>
                    <option value="Momia">Momia</option>
                    <option value="Peso 0: Enfermo">Peso 0: Enfermo</option>
                    <option value="Peso 0: Aplastado">Peso 0: Aplastado</option>
                    <option value="Peso 0: Inanición">Peso 0: Inanición</option>
                </select>
            )
        },
        {
            name: 'Observaciones',
            minWidth: '180px',
            grow: 2,
            cell: row => (
                <input
                    type="text"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 focus:bg-white focus:border-pink-500 outline-none"
                    defaultValue={row.Observaciones || ''}
                    placeholder="—"
                    onBlur={(e) => {
                        if (e.target.value !== (row.Observaciones || '')) {
                            updateCriaField(row.Id_Cria, 'Observaciones', e.target.value)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateCriaField(row.Id_Cria, 'Observaciones', e.target.value)
                            e.target.blur()
                        }
                    }}
                />
            )
        }
    ]

    useEffect(() => {
        getAllCrias()
    }, [])

    const getAllCrias = async () => {
        try {
            const response = await apiAxios.get('/cria/')
            setCrias(response.data)
        } catch (error) {
            console.error("Error cargando crías:", error)
        }
    }

    const updateCriaField = async (id, field, value) => {
        try {
            let data = { [field]: value };

            if (field === 'Estado' && value === 'Muerto') {
                data.Fecha_Muerte = new Date().toISOString().split('T')[0];
            } else if (field === 'Estado' && value === 'Vivo') {
                data.Fecha_Muerte = null;
                data.Causa_Muerte = null;
            }

            await apiAxios.put(`/cria/${id}`, data);

            getAllCrias();

            MySwal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Actualizado',
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error("Error updating field:", error);
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el campo'
            });
        }
    }

    const newListCrias = crias.filter(cria => {
        const text = filterText.toLowerCase()
        const estado = cria.Estado?.toLowerCase() || ''
        const sexoBase = cria.Sexo?.trim().toLowerCase()
        let sexo = ''
        if (sexoBase === 'm') sexo = 'macho'
        else if (sexoBase === 'h') sexo = 'hembra'

        const fechaMuerte = cria.Fecha_Muerte ? cria.Fecha_Muerte.split('T')[0] : ''
        const numCria = cria.Num_Cria?.toString() || ''
        const causaMuerte = cria.Causa_Muerte?.toLowerCase() || ''
        const observaciones = cria.Observaciones?.toLowerCase() || ''

        const matchesText = estado.includes(text) || sexo.includes(text) || numCria.includes(text) || causaMuerte.includes(text) || fechaMuerte.includes(text) || observaciones.includes(text)

        if (partoIdParams) {
            return cria.Id_parto?.toString() === partoIdParams && matchesText
        }

        return matchesText
    })

    const hideModal = () => {
        setCriaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (cria) => {
        setCriaEdit(cria)
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const porcinoInfo = newListCrias[0]?.partos
    return (
        <>
            <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {partoIdParams && (
                            <button
                                onClick={() => navigate('/partos')}
                                className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 transition-colors shadow-xs"
                                title="Volver a Partos"
                            >
                                <TbArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                            <TbMoodKid className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Registro de Crías</h1>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/60">
                                    {newListCrias.length} crías
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Control individual de lechones, estado biológico y causas de baja</p>
                        </div>
                    </div>

                    {porcinoInfo && (
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                                ♀
                            </div>
                            <div>
                                <div className="text-[11px] text-gray-400">Madre del parto</div>
                                <div className="text-xs font-bold text-gray-800">{porcinoInfo.porcino?.Nom_Porcino || '---'}</div>
                            </div>
                            <span className="ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700">
                                Parto #{porcinoInfo.Id_parto}
                            </span>
                        </div>
                    )}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Listado de Crías</h2>
                            <p className="text-xs text-gray-400">Edición rápida de sexo, estado y causa de muerte</p>
                        </div>
                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder:text-gray-400"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar por número, sexo, estado..."
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={newListCrias}
                        keyField="Id_Cria"
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No se encontraron crías registradas
                            </div>
                        }
                    />
                </div>

                <div className="modal fade" id="exampleModal" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title"> {criaEdit ? "Editar Cría" : "Agregar Cría"} </h5>

                                <button
                                    type="button" className="btn-close" data-bs-dismiss="modal" id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <CriaForm key={criaEdit ? criaEdit.Id_Cria : 'new'} hideModal={hideModal} criaEdit={criaEdit} reload={getAllCrias}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div >
        </>
    )
}

export default CrudCrias