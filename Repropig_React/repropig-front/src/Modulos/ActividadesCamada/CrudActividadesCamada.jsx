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
import { ModalResponsables, BotonResponsables } from "../../components/ModalResponsables.jsx"
import { ModalMedicamentos, BotonMedicamentos, getListaMedicamentos } from "../../components/ModalMedicamentos.jsx"
import { getListaResponsables } from "../../utils/responsablesUtils.js"
import { formatearFechaProgramada } from "../../utils/dateUtils.js"
import {
    TbMoodKid,
    TbSearch,
    TbPlus,
    TbPencil,
    TbLock,
    TbPower,
    TbVaccine,
    TbAlertTriangle,
    TbArrowLeft
} from "react-icons/tb"

const CrudActividadesCamada = () => {

    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [actividadEdit, setActividadEdit] = useState(null)
    const [filterText, setFilterText] = useState('')
    const [diaFiltro, setDiaFiltro] = useState(null)
    const [partosList, setPartosList] = useState([])
    const [selectedSegCamada, setSelectedSegCamada] = useState(null)
    const [novedadPorcino, setNovedadPorcino] = useState(null)
    const [novedadForm, setNovedadForm] = useState({ Tipo_Novedad: '', Fecha_Novedad: '', Causa_Motivo: '', Observaciones: '' })
    const [responsables, setResponsables] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [modalResponsablesData, setModalResponsablesData] = useState(null)
    const [modalMedicamentosData, setModalMedicamentosData] = useState(null)
    const { id: partoIdParams } = useParams()
    const navigate = useNavigate()
    const [partoFiltro, setPartoFiltro] = useState(partoIdParams || '')

    useEffect(() => {
        setPartoFiltro(partoIdParams || '')
    }, [partoIdParams])

    const handlePartoChange = (e) => {
        const nuevoParto = e.target.value
        setPartoFiltro(nuevoParto)
        if (nuevoParto) {
            navigate(`/actividades_camada/parto/${nuevoParto}`)
        } else {
            navigate('/actividades_camada')
        }
    }

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
            cell: row => (
                <div className="flex items-center gap-2.5 py-1.5 w-full">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                        <TbMoodKid className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 leading-snug whitespace-normal break-words" title={row.porcino?.Nom_Porcino || `Lechón #${row.Id_Porcino}`}>
                            {row.porcino?.Nom_Porcino || `Lechón #${row.Id_Porcino}`}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                            ID: #{row.Id_Porcino}
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            minWidth: '240px',
            grow: 1.5
        },

        {
            name: 'Día',
            selector: row => `Día ${row.Dia_Programado}`,
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Día {row.Dia_Programado}
                </span>
            ),
            sortable: true,
            width: '95px'
        },
        {
            name: 'Fecha Prog.',
            selector: row => {
                const fecBase = row.porcino?.Fec_Nac_Porcino || row.porcino?.parto?.Fec_fin || row.porcino?.parto?.Fec_inicio;
                return formatearFechaProgramada(fecBase, row.Dia_Programado);
            },
            sortable: true,
            width: '120px'
        },
        {
            name: 'Fecha Real',
            selector: row => row.Fecha_Real?.split('T')[0]?.split('-').reverse().join('/') || '—',
            width: '120px'
        },
        {
            name: 'Peso Lechón',
            selector: row => {
                const peso = row.Peso_Cria;
                let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                let dotColor = "bg-emerald-500";
                if (peso < 1) {
                    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                    dotColor = "bg-rose-500";
                } else if (peso < 2) {
                    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                    dotColor = "bg-amber-500";
                }
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                        {peso} kg
                    </span>
                );
            },
            width: '125px'
        },
        {
            name: 'Responsables',
            minWidth: '160px',
            cell: row => {
                const lista = getListaResponsables(row.Id_Responsable, responsables);
                return (
                    <BotonResponsables
                        lista={lista}
                        theme="purple"
                        onClick={() =>
                            setModalResponsablesData({
                                titulo: "Responsables de Camada",
                                subtitulo: `Seguimiento #${row.Id_SegCamada} — Lechón #${row.Id_Porcino || ""}`,
                                responsables: lista,
                                theme: "purple"
                            })
                        }
                    />
                );
            }
        },
        {
            name: 'Tipo de Actividad',
            selector: row => row.tipo_actividad?.Nombre || '—',
            cell: row => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {row.tipo_actividad?.Nombre || <span className="text-gray-400 italic font-normal">—</span>}
                </span>
            ),
            sortable: true,
            minWidth: '160px'
        },
        {
            name: 'Medicamentos',
            minWidth: '160px',
            cell: row => {
                const lista = getListaMedicamentos(row.Id_Medicamento, medicamentos);
                return (
                    <BotonMedicamentos
                        lista={lista}
                        theme="blue"
                        onClick={() =>
                            setModalMedicamentosData({
                                titulo: "Medicamentos de Camada",
                                subtitulo: `Seguimiento #${row.Id_SegCamada} — Lechón #${row.Id_Porcino || ""}`,
                                medicamentos: lista,
                                theme: "blue"
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
                <span className="text-gray-600 text-xs line-clamp-2" title={row.Observaciones || ""}>
                    {row.Observaciones || <span className="text-gray-400 italic">—</span>}
                </span>
            ),
            minWidth: "180px",
            grow: 1
        },
        {
            name: 'Acciones',
            center: true,
            width: '290px',
            cell: row => {
                const hasNewer = actividades.some(item =>
                    item.Id_Porcino === row.Id_Porcino &&
                    item.Dia_Programado > row.Dia_Programado
                );
                return (
                    <div className="flex items-center justify-center gap-1.5 flex-nowrap py-1">
                        <button
                            className={`p-1.5 rounded-lg border transition-colors ${hasNewer
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                }`}
                            onClick={() => !hasNewer && handleEdit(row)}
                            disabled={hasNewer}
                            title={hasNewer ? "No se puede editar, existe un seguimiento posterior" : "Editar"}
                        >
                            {hasNewer ? <TbLock className="w-4 h-4" /> : <TbPencil className="w-4 h-4" />}
                        </button>
                        <button
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition-colors shadow-xs"
                            title="Ver Actividades"
                            onClick={() => handleOpenSubActividades(row)}
                        >
                            <TbVaccine className="w-3.5 h-3.5" />
                            <span>Actividades</span>
                        </button>
                        <button
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition-colors shadow-xs"
                            title="Registrar Novedad"
                            onClick={() => handleOpenNovedad(row)}
                        >
                            <TbAlertTriangle className="w-3.5 h-3.5" />
                            <span>Novedad</span>
                        </button>
                    </div>
                );
            }
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
        const textToSearch = filterText.trim().toLowerCase()
        let matchesText = true
        if (textToSearch) {
            const nomPorcino = (act.porcino?.Nom_Porcino || '').toLowerCase()
            const idPorcino = String(act.Id_Porcino || act.porcino?.Id_Porcino || '')
            const lechonTag = `lechon #${idPorcino} lechón #${idPorcino} #${idPorcino}`
            const chapetaPorcino = String(act.porcino?.Num_Chapeta || '')

            const cerdaNom = (act.porcino?.parto?.porcino?.Nom_Porcino || '').toLowerCase()
            const cerdaChapeta = String(act.porcino?.parto?.porcino?.Num_Chapeta || '')
            const partoId = String(act.porcino?.Id_parto || act.porcino?.parto?.Id_parto || '')
            const partoTag = `parto #${partoId} parto ${partoId}`

            const diaStr = `día ${act.Dia_Programado} dia ${act.Dia_Programado}`
            const pesoStr = `${act.Peso_Cria || ''} kg`
            const observaciones = (act.Observaciones || '').toLowerCase()

            const meds = getMedicamentosNames(act.Id_Medicamento).join(' ').toLowerCase()
            const resps = getResponsablesNames(act.Id_Responsable).join(' ').toLowerCase()
            const tipoActNom = (act.tipo_actividad?.Nombre || '').toLowerCase()
            const fechaReal = act.Fecha_Real ? act.Fecha_Real.split('T')[0] : ''
            const fechaRealRev = fechaReal ? fechaReal.split('-').reverse().join('/') : ''

            matchesText =
                nomPorcino.includes(textToSearch) ||
                idPorcino.includes(textToSearch) ||
                lechonTag.includes(textToSearch) ||
                chapetaPorcino.includes(textToSearch) ||
                cerdaNom.includes(textToSearch) ||
                cerdaChapeta.includes(textToSearch) ||
                partoId === textToSearch ||
                partoTag.includes(textToSearch) ||
                diaStr.includes(textToSearch) ||
                pesoStr.includes(textToSearch) ||
                observaciones.includes(textToSearch) ||
                meds.includes(textToSearch) ||
                resps.includes(textToSearch) ||
                tipoActNom.includes(textToSearch) ||
                fechaReal.includes(textToSearch) ||
                fechaRealRev.includes(textToSearch)
        }

        let matchesParto = true
        if (partoFiltro) {
            const rowPartoId = act.porcino?.Id_parto || act.porcino?.parto?.Id_parto
            matchesParto = String(rowPartoId) === String(partoFiltro)
        }

        let matchesDia = true
        if (diaFiltro !== null) {
            matchesDia = Number(act.Dia_Programado) === Number(diaFiltro)
        }

        return matchesText && matchesParto && matchesDia
    })

    const partoSeleccionadoObj = partosList.find(p => String(p.Id_parto) === String(partoFiltro))
    const tituloTabla = partoSeleccionadoObj
        ? `Seguimiento de Camada — Cerda: ${partoSeleccionadoObj.porcino?.Nom_Porcino || `#${partoSeleccionadoObj.Id_Porcino}`} (Parto #${partoSeleccionadoObj.Id_parto})`
        : "Seguimiento de Camada"

    const handleOpenSubActividades = (row) => {
        setSelectedSegCamada(row)
        const modal = new bootstrap.Modal(document.getElementById('modalSubActividades'))
        modal.show()
    }

    useEffect(() => {
        const modalEl = document.getElementById('modalNovedadRapida');
        if (!modalEl) return;
        const handleHidden = () => {
            setNovedadPorcino(null);
            setNovedadForm({ Tipo_Novedad: '', Fecha_Novedad: '', Causa_Motivo: '', Observaciones: '' });
        };
        modalEl.addEventListener('hidden.bs.modal', handleHidden);
        return () => modalEl.removeEventListener('hidden.bs.modal', handleHidden);
    }, []);

    const handleOpenNovedad = (row) => {
        const estado = (row.porcino?.Estado || '').trim();
        if (estado === 'Muerto' || estado === 'Inactivo') {
            MySwal.fire({
                icon: 'info',
                title: 'Lechón no disponible',
                text: `Este lechón ya se encuentra registrado como ${estado}. No se pueden registrar más novedades de muerte o descarte.`
            });
            return;
        }
        setNovedadPorcino(row)
        setNovedadForm({ Tipo_Novedad: '', Fecha_Novedad: new Date().toISOString().split('T')[0], Causa_Motivo: '', Observaciones: '' })
        const modal = new bootstrap.Modal(document.getElementById('modalNovedadRapida'))
        modal.show()
    }

    const handleGuardarNovedad = async (e) => {
        e.preventDefault()
        const idPorcino = novedadPorcino?.porcino?.Id_Porcino || novedadPorcino?.Id_Porcino;
        if (!idPorcino) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'No se identificó el porcino.' });
            return;
        }

        if (novedadForm.Tipo_Novedad === 'Muerte' || novedadForm.Tipo_Novedad === 'Descarte') {
            try {
                const resNovs = await apiAxios.get('/novedades/');
                const existente = (resNovs.data || []).find(n =>
                    Number(n.Id_Porcino) === Number(idPorcino) &&
                    ['Muerte', 'Descarte'].includes(n.Tipo_Novedad)
                );
                if (existente) {
                    MySwal.fire({
                        icon: 'warning',
                        title: 'Registro no permitido',
                        text: `Este lechón ya cuenta con un registro de ${existente.Tipo_Novedad}. No se pueden registrar duplicados de muerte o descarte.`
                    });
                    return;
                }
            } catch (err) {
                console.error("Error validando novedad previa:", err);
            }
        }

        try {
            await apiAxios.post('/novedades/', {
                ...novedadForm,
                Id_Porcino: idPorcino
            })
            if (novedadForm.Tipo_Novedad === 'Muerte' || novedadForm.Tipo_Novedad === 'Descarte') {
                await apiAxios.put(`/porcino/${idPorcino}`, { Estado: novedadForm.Tipo_Novedad === 'Muerte' ? 'Muerto' : 'Inactivo' })
            }
            document.getElementById('closeModalNovedadRapida')?.click()
            setNovedadPorcino(null)
            setNovedadForm({ Tipo_Novedad: '', Fecha_Novedad: '', Causa_Motivo: '', Observaciones: '' })
            await getAllActividades()
            MySwal.fire({ icon: 'success', title: 'Novedad registrada', timer: 1500, showConfirmButton: false })
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo guardar la novedad.';
            MySwal.fire({ icon: 'error', title: 'Error', text: msg })
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
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-2xl shadow-inner flex-shrink-0">
                        <TbMoodKid className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Seguimiento de Camada</h1>
                            <span className="px-3 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                                {newListActividades.length === actividades.length
                                    ? `${actividades.length} registros`
                                    : `${newListActividades.length} de ${actividades.length} registros`}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Control clínico y de crecimiento de lechones por día programado
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {partoFiltro && (
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50 text-pink-700 text-sm font-semibold hover:bg-pink-100 transition-colors shadow-xs"
                            onClick={() => navigate('/partos')}
                            title="Regresar a la tabla de partos"
                        >
                            <TbArrowLeft className="w-4 h-4" />
                            <span>Volver a Partos</span>
                        </button>
                    )}
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-md shadow-purple-500/20 px-5 py-2.5 text-sm hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95"
                        data-bs-toggle="modal"
                        data-bs-target="#modalActividadesCamada"
                        onClick={() => setActividadEdit(null)}
                    >
                        <TbPlus className="w-5 h-5" />
                        <span>Nuevo Seguimiento</span>
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 tracking-tight">{tituloTabla}</h2>
                            <p className="text-xs text-gray-500">Filtrado y acciones del seguimiento de lechones</p>
                        </div>
                        <select
                            className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            value={partoFiltro}
                            onChange={handlePartoChange}
                        >
                            <option value="">🐖 Todas las Camadas / Cerdas</option>
                            {partosList.map(p => (
                                <option key={p.Id_parto} value={p.Id_parto}>
                                    Camada Cerda {p.porcino?.Nom_Porcino || `#${p.Id_Porcino}`} ({p.Fec_inicio ? p.Fec_inicio.split('T')[0] : '—'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-1 overflow-x-auto py-1">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Día:</span>
                            <button
                                type="button"
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${diaFiltro === null
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                onClick={() => setDiaFiltro(null)}
                            >
                                TODOS
                            </button>
                            {diasSeguimiento.map(dia => (
                                <button
                                    key={dia}
                                    type="button"
                                    className={`px-2 py-1 rounded-xl text-xs font-semibold transition-all ${diaFiltro === dia
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    onClick={() => setDiaFiltro(diaFiltro === dia ? null : dia)}
                                >
                                    {dia}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <TbSearch className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar lechón, obs, med..."
                                    className="w-full pl-9 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                                {filterText && (
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() => setFilterText('')}
                                        title="Limpiar búsqueda"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {(filterText || diaFiltro !== null || partoFiltro) && (
                                <button
                                    type="button"
                                    className="px-2.5 py-2 rounded-xl text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all whitespace-nowrap shadow-xs"
                                    onClick={() => {
                                        setFilterText('')
                                        setDiaFiltro(null)
                                        setPartoFiltro('')
                                        navigate('/actividades_camada')
                                    }}
                                    title="Quitar todos los filtros"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={newListActividades}
                        keyField="Id_SegCamada"
                        pagination
                        highlightOnHover
                        pointerOnHover
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="py-12 text-center text-gray-500 font-medium">
                                No hay registros para la camada o día seleccionado
                            </div>
                        }
                    />
                </div>
            </div>

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
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                        onClick={() => {
                                            setNovedadPorcino(null);
                                            setNovedadForm({ Tipo_Novedad: '', Fecha_Novedad: '', Causa_Motivo: '', Observaciones: '' });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-danger">Guardar Novedad</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Responsables */}
            <ModalResponsables
                data={modalResponsablesData}
                onClose={() => setModalResponsablesData(null)}
            />

            {/* Modal de Medicamentos */}
            <ModalMedicamentos
                data={modalMedicamentosData}
                onClose={() => setModalMedicamentosData(null)}
            />

        </div>
    )
}

export default CrudActividadesCamada
