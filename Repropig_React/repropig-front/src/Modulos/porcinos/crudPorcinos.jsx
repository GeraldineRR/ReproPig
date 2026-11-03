import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import PorcinoForm from "./porcinoForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { customTableStyles } from "../../styles/tableStyles.js"
import { formatearFecha } from "../../utils/dateUtils.js"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import {
    TbPig,
    TbSearch,
    TbPlus,
    TbPencil,
    TbQrcode,
    TbEye
} from "react-icons/tb"

const MySwal = withReactContent(Swal)

const CrudPorcinos = () => {

    const [porcinos, setPorcinos] = useState([])
    const [loadingId, setLoadingId] = useState(null);

    const calcularEdadLlegada = (fechaNacimiento, fechaLlegada) => {
        if (!fechaNacimiento || !fechaLlegada) return null

        const nacimiento = new Date(fechaNacimiento)
        const llegada = new Date(fechaLlegada)

        let años = llegada.getFullYear() - nacimiento.getFullYear()
        let meses = llegada.getMonth() - nacimiento.getMonth()

        if (meses < 0) {
            años--
            meses += 12
        }

        return años * 12 + meses
    }

    const calcularEdadActual = (fechaNacimiento) => {
        if (!fechaNacimiento) return 0

        const nacimiento = new Date(fechaNacimiento)
        const hoy = new Date()

        if (hoy < nacimiento) return 0

        let años = hoy.getFullYear() - nacimiento.getFullYear()
        let meses = hoy.getMonth() - nacimiento.getMonth()

        if (meses < 0) {
            años--
            meses += 12
        }

        return años * 12 + meses
    }

    // Función para alternar el estado del porcino con confirmación SweetAlert
    const toggleEstado = async (row) => {
        const id = row.Id_Porcino;
        const esActivo = row.Estado === 'Activo';
        const accion = esActivo ? 'inactivar' : 'activar';
        const nombrePorcino = row.Nom_Porcino || (row.Num_Chapeta ? `Chapeta: ${row.Num_Chapeta}` : `Porcino #${id}`);

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} este porcino?`,
            text: `El porcino ${nombrePorcino} pasará a estar ${esActivo ? 'Inactivo' : 'Activo'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoadingId(id);

            try {
                const res = await apiAxios.put(`/porcino/${id}/toggle-estado`);

                MySwal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    text: `El porcino ahora está ${res.data.Estado}.`,
                    timer: 1500,
                    showConfirmButton: false
                });

                setPorcinos(prev =>
                    prev.map(p =>
                        p.Id_Porcino === id
                            ? { ...p, Estado: res.data.Estado }
                            : p
                    )
                );

            } catch (error) {
                console.error(error);
                MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cambiar el estado del porcino.'
                });
            } finally {
                setLoadingId(null);
            }
        }
    };

    const [porcinoEdit, setPorcinoEdit] = useState(null)
    const [formCounter, setFormCounter] = useState(0)
    const [porcinoQR, setPorcinoQR] = useState(null)
    const [filterText, setFilterText] = useState('')
    const [filterTipo, setFilterTipo] = useState('Adulto')
    const [partosMap, setPartosMap] = useState({})

    const columnsAdultos = [
        {
            name: 'Porcino',
            selector: row => row.Nom_Porcino,
            sortable: true,
            minWidth: '180px',
            cell: row => {
                return (
                    <div className="flex items-center gap-2.5 py-1">
                        <div>
                            <div className="font-semibold text-gray-900 text-xs">
                                {row.Nom_Porcino || '---'}
                            </div>
                            <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-1.5 items-center">
                                <span>{row.Num_Chapeta ? `Chapeta: ${row.Num_Chapeta}` : `ID: #${row.Id_Porcino}`}</span>
                                {row.Plac_Sena_Porcino && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span>Placa: {row.Plac_Sena_Porcino}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            name: 'Raza',
            selector: row => row.raza?.Nom_Raza || '—',
            sortable: true,
            width: '120px',
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                    {row.raza?.Nom_Raza || '—'}
                </span>
            )
        },
        {
            name: 'Sexo',
            width: '110px',
            cell: row => {
                const isHembra = row.Gen_Porcino?.trim().toLowerCase() === 'h';
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isHembra ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {isHembra ? '♀ Hembra' : '♂ Macho'}
                    </span>
                );
            }
        },
        {
            name: 'Tipo',
            width: '100px',
            cell: row => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${row.Tipo_Cerdo === 'Lechon' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                    {row.Tipo_Cerdo || '---'}
                </span>
            )
        },
        {
            name: 'Procedencia',
            minWidth: '150px',
            cell: row => (
                <div className="flex flex-col gap-0.5 py-1">
                    <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${row.Proc_Porcino?.trim().toLowerCase() === 'interno' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}>
                            {row.Proc_Porcino || '---'}
                        </span>
                    </div>
                    {row.Lug_Proc_Porcino && (
                        <span className="text-[11px] text-gray-400 truncate max-w-[140px]" title={row.Lug_Proc_Porcino}>
                            {row.Lug_Proc_Porcino}
                        </span>
                    )}
                </div>
            )
        },
        {
            name: 'Fecha Nac.',
            selector: row => row.Fec_Nac_Porcino,
            width: '110px',
            cell: row => <span className="text-xs text-gray-700 whitespace-nowrap">{formatearFecha(row.Fec_Nac_Porcino) || '---'}</span>
        },
        {
            name: 'Fecha Lleg.',
            selector: row => row.Fec_Llegada,
            width: '110px',
            cell: row => <span className="text-xs text-gray-700 whitespace-nowrap">{formatearFecha(row.Fec_Llegada) || '---'}</span>
        },
        {
            name: 'Peso Lleg',
            width: '110px',
            cell: row => {
                const peso = row.Peso_Llegada;
                if (!peso) return <span className="text-gray-400 text-xs">---</span>;
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                        {peso} kg
                    </span>
                );
            }
        },
        {
            name: 'Edad Actual',
            width: '110px',
            cell: row => {
                const edad = calcularEdadActual(row.Fec_Nac_Porcino);
                return <span className="text-xs font-medium text-gray-800">{edad} meses</span>;
            }
        },
        {
            name: 'Rendimiento',
            width: '130px',
            cell: row => {
                const isHembra = row.Gen_Porcino?.trim().toLowerCase() === 'h';
                if (!isHembra) return <span className="text-gray-400 text-xs">—</span>;

                const infoPartos = partosMap[row.Id_Porcino];
                if (!infoPartos || infoPartos.totalPartos === 0) {
                    return <span className="text-gray-400 text-xs">Sin partos</span>;
                }

                const promedio = Number((infoPartos.totalNacidos / infoPartos.totalPartos).toFixed(1));
                if (promedio < 14) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200" title={`Promedio de ${promedio} lechones por parto (< 14)`}>
                            ⚠️ {promedio} lech.
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title={`Promedio de ${promedio} lechones por parto (≥ 14)`}>
                        ⭐ {promedio} lech.
                    </span>
                );
            }
        },
        {
            name: 'Estado',
            center: true,
            width: '120px',
            cell: row => {
                const isActivo = row.Estado === 'Activo';
                return (
                    <button
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${isActivo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                            }`}
                        onClick={() => toggleEstado(row)}
                        disabled={loadingId === row.Id_Porcino}
                        title="Clic para cambiar estado"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {loadingId === row.Id_Porcino ? '...' : row.Estado}
                    </button>
                );
            }
        },
        {
            name: 'Acciones',
            center: true,
            width: '130px',
            cell: row => (
                <div className="flex gap-1.5 items-center justify-center w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-xs"
                        onClick={() => handleEdit(row)}
                        title="Editar"
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                    {row.Gen_Porcino?.trim().toLowerCase() === 'h' && (
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shadow-xs"
                            onClick={() => handleShowQR(row)}
                            title="Ver QR de Cerda"
                        >
                            <TbQrcode className="w-4 h-4" />
                        </button>
                    )}
                    {row.Gen_Porcino?.trim().toLowerCase() === 'h' && (
                        <Link
                            to={`/perfil-cerda/${row.Id_Porcino}`}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-xs"
                            title="Ver Perfil Completo"
                        >
                            <TbEye className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            )
        }
    ];

    const columnsLechones = [
        {
            name: 'Porcino',
            selector: row => row.Nom_Porcino,
            sortable: true,
            minWidth: '180px',
            cell: row => {
                return (
                    <div className="flex items-center gap-2.5 py-1">
                        <div>
                            <div className="font-semibold text-gray-900 text-xs">
                                {row.Nom_Porcino || '---'}
                            </div>
                            <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-1.5 items-center">
                                <span>{row.Num_Chapeta ? `Chapeta: ${row.Num_Chapeta}` : `ID: #${row.Id_Porcino}`}</span>
                                {row.Plac_Sena_Porcino && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span>Placa: {row.Plac_Sena_Porcino}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            name: 'Sexo',
            width: '110px',
            cell: row => {
                const isHembra = row.Gen_Porcino?.trim().toLowerCase() === 'h';
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isHembra ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {isHembra ? '♀ Hembra' : '♂ Macho'}
                    </span>
                );
            }
        },
        {
            name: 'Tipo',
            width: '100px',
            cell: row => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${row.Tipo_Cerdo === 'Lechon' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                    {row.Tipo_Cerdo || '---'}
                </span>
            )
        },
        {
            name: 'Procedencia',
            minWidth: '150px',
            cell: row => (
                <div className="flex flex-col gap-0.5 py-1">
                    <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${row.Proc_Porcino?.trim().toLowerCase() === 'interno' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}>
                            {row.Proc_Porcino || '---'}
                        </span>
                    </div>
                    {row.Lug_Proc_Porcino && (
                        <span className="text-[11px] text-gray-400 truncate max-w-[140px]" title={row.Lug_Proc_Porcino}>
                            {row.Lug_Proc_Porcino}
                        </span>
                    )}
                </div>
            )
        },
        {
            name: 'Fecha Nac.',
            selector: row => row.Fec_Nac_Porcino,
            width: '120px',
            cell: row => <span className="text-xs text-gray-700 whitespace-nowrap">{formatearFecha(row.Fec_Nac_Porcino) || '---'}</span>
        },
        {
            name: 'Peso al Nacer',
            selector: row => row.Pes_Nacer,
            sortable: true,
            width: '130px',
            cell: row => {
                const peso = row.Pes_Nacer;
                if (!peso) return <span className="text-gray-400 text-xs">---</span>;
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                        {peso} kg
                    </span>
                );
            }
        },
        {
            name: 'Observaciones',
            selector: row => row.Observaciones || '---',
            sortable: true,
            minWidth: '180px',
            cell: row => (
                <span
                    className="text-xs text-gray-600 truncate block max-w-full"
                    title={row.Observaciones || '---'}
                >
                    {row.Observaciones || '---'}
                </span>
            )
        },
        {
            name: 'Estado',
            center: true,
            width: '120px',
            cell: row => {
                const isActivo = row.Estado === 'Activo';
                return (
                    <button
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${isActivo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                            }`}
                        onClick={() => toggleEstado(row)}
                        disabled={loadingId === row.Id_Porcino}
                        title="Clic para cambiar estado"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {loadingId === row.Id_Porcino ? '...' : row.Estado}
                    </button>
                );
            }
        },
        {
            name: 'Acciones',
            center: true,
            width: '100px',
            cell: row => (
                <div className="flex gap-1.5 items-center justify-center w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-xs"
                        onClick={() => handleEdit(row)}
                        title="Editar"
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const columnsTable = filterTipo === 'Lechon' ? columnsLechones : columnsAdultos;


    // =========================================================
    // CARGAR DATOS AL INICIAR
    // =========================================================


    useEffect(() => {

        getAllPorcinos()

    }, [])

    const getAllPorcinos = async () => {
        try {
            const [resPorcinos, resPartos] = await Promise.all([
                apiAxios.get('/porcino/'),
                apiAxios.get('/partos/').catch(() => ({ data: [] }))
            ])
            setPorcinos(resPorcinos.data)

            const map = {}
            resPartos.data.forEach(p => {
                const idCerda = p.Id_Porcino
                if (!map[idCerda]) map[idCerda] = { totalPartos: 0, totalNacidos: 0 }
                map[idCerda].totalPartos += 1
                const nacidosParto = (p.Nac_vivos || 0) + (p.Nac_muertos || 0) + (p.Nac_momias || 0)
                map[idCerda].totalNacidos += nacidosParto
            })
            setPartosMap(map)
        } catch (err) {
            console.error("Error al cargar porcinos o partos:", err)
        }
    }

    const newListPorcinos = porcinos.filter(porcino => {

        const textToSearch = filterText.toLowerCase()

        const chapeta = porcino.Num_Chapeta?.toString().toLowerCase() || ''
        const nombre = porcino.Nom_Porcino?.toLowerCase() || ''
        const placa = porcino.Plac_Sena_Porcino?.toString().toLowerCase() || ''
        const procedencia = porcino.Proc_Porcino?.toLowerCase() || ''
        const lugarProc = porcino.Lug_Proc_Porcino?.toLowerCase() || ''
        const observaciones = porcino.Observaciones?.toLowerCase() || ''
        const sexoBase = porcino.Gen_Porcino?.trim().toLowerCase() || ''
        let sexo = ''
        if (sexoBase === 'm') sexo = 'macho'
        else if (sexoBase === 'h') sexo = 'hembra'
        else sexo = sexoBase

        const pasaTexto = (
            chapeta.includes(textToSearch) ||
            nombre.includes(textToSearch) ||
            placa.includes(textToSearch) ||
            procedencia.includes(textToSearch) ||
            lugarProc.includes(textToSearch) ||
            observaciones.includes(textToSearch) ||
            sexo.includes(textToSearch)
        )

        const tipoPorcino = (porcino.Tipo_Cerdo || 'Adulto').trim().toLowerCase()
        const pasaTipo = tipoPorcino === filterTipo.toLowerCase()
        const noEsMuertoNacer = porcino.Gen_Porcino !== '-'

        return pasaTexto && pasaTipo && noEsMuertoNacer
    })

    useEffect(() => {
        const modalEl = document.getElementById('exampleModal')
        if (!modalEl) return
        const handleModalHidden = () => {
            setPorcinoEdit(null)
            setFormCounter(prev => prev + 1)
        }
        modalEl.addEventListener('hidden.bs.modal', handleModalHidden)
        return () => {
            modalEl.removeEventListener('hidden.bs.modal', handleModalHidden)
        }
    }, [])

    const hideModal = () => {
        setPorcinoEdit(null)
        setFormCounter(prev => prev + 1)
        const closeBtn = document.getElementById('closeModal')
        if (closeBtn) closeBtn.click()
    }

    const handleOpenCreate = () => {
        setPorcinoEdit(null)
        setFormCounter(prev => prev + 1)
    }

    const handleEdit = (porcino) => {
        setPorcinoEdit(porcino)
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const handleShowQR = (porcino) => {
        setPorcinoQR(porcino)
        const modal = new bootstrap.Modal(document.getElementById('qrModal'))
        modal.show()
    }

    return (
        <>
            <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                            <TbPig className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Registro de Porcinos</h1>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/60">
                                    {newListPorcinos.length} registrados
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Control individual, chapetas, razas, rendimiento y seguimiento de piara</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Selector de categoría */}
                        <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200/60">
                            {['Adulto', 'Lechon'].map(tipo => (
                                <button
                                    key={tipo}
                                    type="button"
                                    onClick={() => setFilterTipo(tipo)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterTipo === tipo
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {tipo === 'Adulto' ? '🐗 Adultos' : '🐽 Lechones'}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-md hover:from-pink-700 hover:to-rose-700 hover:shadow-lg transition-all duration-200"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={handleOpenCreate}
                        >
                            <TbPlus className="w-5 h-5" />
                            <span>
                                {filterTipo === 'Lechon' ? 'Registrar Lechón' : 'Registrar Adulto'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Listado de Porcinos</h2>
                            <p className="text-xs text-gray-400">Datos genealógicos, estado biológico y trazabilidad</p>
                        </div>
                        <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder:text-gray-400"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar por nombre, chapeta, placa..."
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columnsTable}
                        data={newListPorcinos}
                        keyField="Id_Porcino"
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No se encontraron porcinos registrados
                            </div>
                        }
                    />
                </div>


                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">
                                    {porcinoEdit
                                        ? (porcinoEdit.Tipo_Cerdo === 'Lechon' ? "Editar Lechón" : "Editar Adulto")
                                        : (filterTipo === 'Lechon' ? "Agregar Lechón" : "Agregar Adulto")}
                                </h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal"></button>
                            </div>
                            <div className="modal-body">
                                <PorcinoForm
                                    key={porcinoEdit ? `edit_${porcinoEdit.Id_Porcino}` : `new_${filterTipo}_${formCounter}`}
                                    hideModal={hideModal}
                                    porcinoEdit={porcinoEdit}
                                    reload={getAllPorcinos}
                                    initialTipo={filterTipo === 'Lechon' ? 'Lechon' : 'Adulto'}
                                    porcinosList={porcinos}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal para Código QR */}
                <div className="modal fade" id="qrModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-sm modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0 pb-0">
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body text-center pt-0 pb-4">
                                {porcinoQR && (
                                    <>
                                        <h5 className="mb-1 text-danger fw-bold">{porcinoQR.Nom_Porcino}</h5>
                                        <p className="text-muted small mb-3">Chapeta: {porcinoQR.Num_Chapeta}</p>
                                        <div className="p-3 bg-white d-inline-block rounded shadow-sm border">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/perfil-cerda/${porcinoQR.Id_Porcino}`}
                                                size={200}
                                            />
                                        </div>
                                        <p className="text-muted mt-3 small px-3">
                                            Escanea este código con tu celular para ver el historial reproductivo completo.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CrudPorcinos