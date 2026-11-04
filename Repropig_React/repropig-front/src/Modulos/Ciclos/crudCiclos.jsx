import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
import CalendarioForm from "../Calendario/CalendarioForm.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import {
    TbRefresh,
    TbSearch,
    TbPlus,
    TbCalendar,
    TbPencil
} from "react-icons/tb"


const CrudCiclos = () => {
    const auth = useAuth() || {};
    const { usuario } = auth;
    const MySwal = WithReactContent(Swal)
    const navigate = useNavigate()
    const location = useLocation()
    const [ciclos, setCiclos] = useState([])
    const [cicloEdit, setCicloEdit] = useState(null)
    const [filterText, setFilterText] = useState("")

    useEffect(() => {
        if (location.state?.Id_Ciclo) {
            setFilterText(String(location.state.Id_Ciclo))
        }
    }, [location.state])
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

    const [novedadesMap, setNovedadesMap] = useState({})

    const getAllCiclos = async () => {
        try {

            const [ciclosRes, novRes] = await Promise.allSettled([
                apiAxios.get('/ciclos/'),
                apiAxios.get('/novedades/')
            ])

            const newMap = {}
            if (novRes.status === 'fulfilled' && Array.isArray(novRes.value.data)) {
                novRes.value.data.forEach(n => {
                    const tipo = (n.Tipo_Novedad || '').trim()
                    const idPorcino = n.Id_Porcino || n.porcino?.Id_Porcino
                    if (idPorcino && ['Muerte', 'Descarte', 'Traslado'].includes(tipo)) {
                        if (!newMap[idPorcino]) {
                            newMap[idPorcino] = n
                        }
                    }
                })
                setNovedadesMap(newMap)
            }

            if (ciclosRes.status === 'fulfilled') {
                const sorted = [...(ciclosRes.value.data || [])].sort((a, b) => Number(b.Id_Ciclo) - Number(a.Id_Ciclo))
                setCiclos(sorted)
            }

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
        const isActivo = (row.Estado || '').toUpperCase() === 'ACTIVO';
        setCalendarioIsInactive(!isActivo)

        const todasFechas = [
            ...((row.montas || []).map(m => m.Fec_hora).filter(Boolean)),
            ...((row.inseminaciones || []).map(i => i.Fec_hora).filter(Boolean))
        ]
        const primeraFecha = todasFechas.length ? todasFechas.sort()[0] : ''
        const fecha = primeraFecha ? String(primeraFecha).split('T')[0].split(' ')[0] : ''

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
            Id_Porcino: row.Id_Cerda || row.Id_Porcino || '',
            TipoCiclo: tipoCiclo,
            activo: row.Estado || row.Estado || 'Activo',
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
        const info = getProgresoYEstado(ciclo)
        if (info.isBaja) {
            MySwal.fire({
                icon: 'info',
                title: 'Ciclo Inactivo',
                text: `Este ciclo pertenece a una cerda con baja registrada (${info.motivoBaja}) y no puede ser modificado.`
            })
            return
        }
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
        const cargo = (usuario?.Cargo || usuario?.cargo || usuario?.Rol || usuario?.rol || '').toLowerCase()
        const tienePermiso = cargo.includes('instructor') || cargo.includes('gestor') || cargo.includes('admin')
        if (!tienePermiso) {
            MySwal.fire({
                icon: 'warning',
                title: 'Acceso denegado',
                text: 'Pídele permiso al instructor o gestor para activar o inactivar el ciclo.'
            })
            return
        }

        const info = getProgresoYEstado(row)
        const isActivo = info.isActivo

        if (!isActivo && info.isBaja) {
            MySwal.fire({
                icon: 'error',
                title: 'No se puede activar el ciclo',
                text: `La cerda "${row.porcino?.Nom_Porcino || ''}" tiene registro de baja (${info.motivoBaja}). Sus ciclos reproductivos no se pueden reactivar.`
            })
            return
        }

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

    const getFechaServicio = (row) => {
        const fechas = [
            ...(row.montas || []).map(m => m.Fec_hora).filter(Boolean),
            ...(row.inseminaciones || []).map(i => i.Fec_hora).filter(Boolean)
        ];
        if (!fechas.length) return null;
        const primera = fechas.sort()[0];
        // Retornar estrictamente YYYY-MM-DD sin hora
        return String(primera).split('T')[0].split(' ')[0];
    };

    const calcularDiasGestacion = (row) => {
        const fec = getFechaServicio(row);
        if (!fec) return '-';
        try {
            const clean = String(fec).split('T')[0].split(' ')[0];
            const [y, m, d] = clean.split('-').map(Number);
            if (!y || !m || !d) return '-';
            const servicio = new Date(y, m - 1, d);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const dias = Math.floor((hoy - servicio) / (1000 * 60 * 60 * 24));
            return dias > 0 ? dias : 0;
        } catch (e) {
            return '-';
        }
    }

    const getProgresoYEstado = (row, novMap = novedadesMap) => {
        const cal = row.calendario;
        const hayParto = !!cal?.real_parto || (row.partos && row.partos.length > 0);
        const hayRecelo = cal?.resultado_rc1 === 'recelo_detectado' || cal?.resultado_rc2 === 'recelo_detectado';
        const estadoRaw = (row.Estado || '').trim();

        // 1. Si dentro del calendario se realiza el registro del parto -> Finalizado
        if (hayParto || estadoRaw.toLowerCase() === 'finalizado') {
            return {
                estado: 'Finalizado',
                progreso: 100,
                badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
                dotClass: 'bg-blue-500',
                barClass: 'bg-blue-500',
                textoProgreso: 'Parto registrado (100%)',
                isFinalizado: true,
                isFallido: false,
                isActivo: false,
                isBaja: false
            };
        }

        // 2. Si dentro del calendario se registra que sí presentó recelo (RC1 o RC2) -> Fallido
        if (hayRecelo || estadoRaw.toLowerCase() === 'fallido') {
            let pasos = 1;
            if (cal?.resultado_rc2 === 'recelo_detectado') pasos = 2;
            const pct = pasos * 20;

            return {
                estado: 'Fallido',
                progreso: pct,
                badgeClass: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
                dotClass: 'bg-rose-500',
                barClass: 'bg-rose-500',
                textoProgreso: 'Recelo detectado',
                isFinalizado: false,
                isFallido: true,
                isActivo: false,
                isBaja: false
            };
        }

        // 3. Proceso avanzando según cada evento del calendario:
        let eventosCompletados = 0;
        if (cal?.real_rc1) eventosCompletados++;
        if (cal?.real_rc2) eventosCompletados++;
        if (cal?.real_cambio_alimento) eventosCompletados++;
        if (cal?.real_dia_107) eventosCompletados++;
        if (cal?.real_parto) eventosCompletados++;

        const progresoCalculado = eventosCompletados * 20;

        // 4. Verificar si la cerda tiene novedad de baja (Muerte, Descarte, Traslado) o estado no activo
        const idCerda = row.Id_Cerda || row.porcino?.Id_Porcino;
        const novBaja = novMap?.[idCerda] || (row.porcino?.novedades || []).find(n =>
            ['muerte', 'descarte', 'traslado'].includes((n.Tipo_Novedad || '').toLowerCase())
        );
        const estadoPorcino = (row.porcino?.Estado || '').trim().toLowerCase();

        let motivoBaja = null;
        if (novBaja) {
            const tipo = (novBaja.Tipo_Novedad || '').toLowerCase();
            if (tipo === 'muerte') motivoBaja = 'Muerte';
            else if (tipo === 'traslado') motivoBaja = 'Traslado';
            else if (tipo === 'descarte') motivoBaja = 'Descarte';
        } else if (estadoPorcino === 'muerto') {
            motivoBaja = 'Muerte';
        } else if (estadoPorcino === 'trasladado') {
            motivoBaja = 'Traslado';
        } else if (estadoPorcino === 'inactivo') {
            motivoBaja = 'Descarte';
        }

        if (motivoBaja) {
            let badgeClass = 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20';
            let dotClass = 'bg-rose-500';
            let barClass = 'bg-rose-400';
            let motivoTexto = motivoBaja === 'Muerte' ? 'Muerto' : motivoBaja;

            if (motivoBaja.toLowerCase().includes('traslado')) {
                badgeClass = 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
                dotClass = 'bg-amber-500';
                barClass = 'bg-amber-400';
                motivoTexto = 'Traslado';
            } else if (motivoBaja.toLowerCase().includes('descarte')) {
                badgeClass = 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20';
                dotClass = 'bg-slate-500';
                barClass = 'bg-slate-400';
                motivoTexto = 'Descarte';
            }

            return {
                estado: `Inactivo (${motivoTexto})`,
                progreso: progresoCalculado,
                badgeClass,
                dotClass,
                barClass,
                textoProgreso: `Detenido por ${motivoTexto} (${eventosCompletados}/5 etapas)`,
                isFinalizado: false,
                isFallido: false,
                isActivo: false,
                isBaja: true,
                motivoBaja: motivoTexto
            };
        }

        if (estadoRaw.toLowerCase() === 'inactivo') {
            return {
                estado: 'Inactivo',
                progreso: progresoCalculado,
                badgeClass: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10',
                dotClass: 'bg-gray-400',
                barClass: 'bg-gray-400',
                textoProgreso: `${eventosCompletados}/5 etapas`,
                isFinalizado: false,
                isFallido: false,
                isActivo: false,
                isBaja: false
            };
        }

        return {
            estado: 'Activo',
            progreso: progresoCalculado,
            badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
            dotClass: 'bg-emerald-500 animate-pulse',
            barClass: 'bg-emerald-500',
            textoProgreso: `${eventosCompletados}/5 etapas completadas`,
            isFinalizado: false,
            isFallido: false,
            isActivo: true,
            isBaja: false
        };
    };

    const columnsTable = [
        {
            name: 'Id',
            selector: row => row.Id_Ciclo,
            sortable: true,
            width: '80px',
            cell: row => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    #{row.Id_Ciclo}
                </span>
            )
        },
        {
            name: 'Cerda',
            selector: row => row.porcino?.Nom_Porcino || 'Sin nombre',
            sortable: true,
            minWidth: '160px',
            cell: row => {
                const info = getProgresoYEstado(row);
                return (
                    <div className="flex items-center gap-2.5 py-1">
                        <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-gray-900 text-xs">
                                    {row.porcino?.Nom_Porcino || 'Sin nombre'}
                                </span>
                                {info.isBaja && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        info.motivoBaja === 'Muerte' || info.motivoBaja === 'Muerto'
                                            ? 'bg-rose-100 text-rose-700'
                                            : info.motivoBaja === 'Traslado'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {info.motivoBaja}
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-gray-400">
                                {row.porcino?.Num_Chapeta ? `Chapeta: ${row.porcino.Num_Chapeta}` : (row.Id_Cerda ? `ID: #${row.Id_Cerda}` : '')}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            name: 'Tipo',
            width: '135px',
            selector: row => {
                const tieneMontas = row.montas?.length > 0;
                const tieneInseminaciones = row.inseminaciones?.length > 0;
                if (tieneMontas && tieneInseminaciones) return 'Monta + Insem';
                if (tieneMontas) return 'Monta';
                if (tieneInseminaciones) return 'Inseminación';
                return row.TipoCiclo || '---';
            },
            cell: row => {
                const tieneMontas = row.montas?.length > 0;
                const tieneInseminaciones = row.inseminaciones?.length > 0;
                let texto = row.TipoCiclo || '---';
                let colorClass = 'bg-gray-50 text-gray-600 border-gray-200';
                if (tieneMontas && tieneInseminaciones) {
                    texto = 'Monta + Insem';
                    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
                } else if (tieneMontas) {
                    texto = 'Monta';
                    colorClass = 'bg-pink-50 text-pink-700 border-pink-200';
                } else if (tieneInseminaciones) {
                    texto = 'Inseminación';
                    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
                }
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${colorClass}`}>
                        {texto}
                    </span>
                );
            }
        },
        {
            name: 'Estado / Progreso',
            width: '210px',
            cell: row => {
                const info = getProgresoYEstado(row);

                return (
                    <div
                        className="w-full py-1"
                        style={{ cursor: info.isActivo || info.estado === 'Inactivo' || info.isBaja ? 'pointer' : 'default' }}
                        onClick={() => {
                            if (info.isActivo || info.estado === 'Inactivo' || info.isBaja) {
                                handleToggleActivo(row);
                            }
                        }}
                        title={
                            info.isBaja
                                ? `Ciclo detenido e inactivo por motivo: ${info.motivoBaja}`
                                : info.isActivo || info.estado === 'Inactivo'
                                ? "Click para cambiar estado Activo/Inactivo"
                                : `Ciclo ${info.estado}`
                        }
                    >
                        <div className="flex justify-between items-center mb-1.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${info.badgeClass}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${info.dotClass}`}></div>
                                {info.estado}
                            </span>
                            <span className={`text-xs font-bold ${info.isFinalizado ? 'text-blue-600' :
                                    info.isFallido ? 'text-rose-500' :
                                        info.isActivo ? 'text-emerald-600' : 'text-gray-400'
                                }`}>
                                {info.progreso}%
                            </span>
                        </div>

                        {/* Barra de progreso según los eventos del calendario */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${info.barClass}`}
                                style={{ width: `${info.progreso}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                            <span>{info.textoProgreso}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            name: 'F. Servicio',
            width: '120px',
            cell: row => <span className="text-xs font-medium text-gray-800">{getFechaServicio(row) || '-'}</span>,
            selector: row => getFechaServicio(row) || '-',
            sortable: true
        },
        {
            name: 'Días Gestación',
            width: '110px',
            center: true,
            cell: row => {
                const dias = calcularDiasGestacion(row);
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {dias} d
                    </span>
                );
            },
            sortable: true
        },
        {
            name: 'Montas',
            width: '100px',
            cell: row => {

                const cantMontas = row.montas?.length || 0;
                const info = getProgresoYEstado(row);
                // Bloquear únicamente si el ciclo NO está activo y no tiene registros
                const bloquear = !info.isActivo && cantMontas === 0;

                if (bloquear) {
                    return (
                        <div
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-400 rounded-lg font-semibold text-xs cursor-not-allowed opacity-50 select-none"
                            title="Ciclo cerrado/inactivo sin montas (no hay registros)"
                        >
                            <span className="text-sm">🐷</span> 0
                        </div>
                    );
                }

                return (
                    <div
                        onClick={() => navigate('/montas', { state: { Id_Ciclo: row.Id_Ciclo, Id_Porcino: row.Id_Cerda, Nom_Porcino: row.porcino?.Nom_Porcino, Activo: row.Estado, Estado: info.estado } })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 ${cantMontas > 0 ? 'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-600/20' : 'bg-pink-50/70 text-pink-600 border border-pink-200/80'} rounded-lg font-semibold text-xs cursor-pointer hover:bg-pink-100 transition-colors shadow-xs`}
                        title={info.isActivo && cantMontas === 0 ? "Ciclo activo: Click para registrar o gestionar montas" : "Ver montas de este ciclo"}
                    >
                        <span className="text-sm">🐷</span> {cantMontas}

                    </div>
                );
            }
        },
        {
            name: 'Inseminaciones',
            width: '140px',
            cell: row => {

                const cantInsem = row.inseminaciones?.length || 0;
                const info = getProgresoYEstado(row);
                // Bloquear únicamente si el ciclo NO está activo y no tiene registros
                const bloquear = !info.isActivo && cantInsem === 0;


                if (bloquear) {
                    return (
                        <div
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-400 rounded-lg font-semibold text-xs cursor-not-allowed opacity-50 select-none"
                            title="Ciclo cerrado/inactivo sin inseminaciones (no hay registros)"
                        >
                            <span className="text-sm">💉</span> 0
                        </div>
                    );
                }

                return (
                    <div
                        onClick={() => navigate('/inseminaciones', { state: { Id_Ciclo: row.Id_Ciclo, Id_Porcino: row.Id_Cerda, Nom_Porcino: row.porcino?.Nom_Porcino, Activo: row.Estado, Estado: info.estado } })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 ${cantInsem > 0 ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' : 'bg-blue-50/70 text-blue-600 border border-blue-200/80'} rounded-lg font-semibold text-xs cursor-pointer hover:bg-blue-100 transition-colors shadow-xs`}
                        title={info.isActivo && cantInsem === 0 ? "Ciclo activo: Click para registrar o gestionar inseminaciones" : "Ver inseminaciones de este ciclo"}
                    >
                        <span className="text-sm">💉</span> {cantInsem}
                    </div>
                );
            }
        },
        {
            name: 'Acciones',
            width: '110px',
            cell: row => (
                <div className="flex gap-1.5 items-center justify-end w-full">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shadow-xs"
                        title="Calendario"
                        onClick={() => handleAgregarCalendario(row)}
                    >
                        <TbCalendar className="w-4 h-4" />
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-xs"
                        title="Editar"
                        onClick={() => handleEdit(row)}
                    >
                        <TbPencil className="w-4 h-4" />
                    </button>
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


    const filteredCiclos = [...ciclos]
        .sort((a, b) => Number(b.Id_Ciclo) - Number(a.Id_Ciclo))

        .filter(rep => {
            const text = filterText.toLowerCase()
            return (
                rep.Id_Ciclo?.toString().includes(text) ||
                rep.porcino?.Nom_Porcino?.toLowerCase().includes(text) ||
                rep.TipoCiclo?.toLowerCase().includes(text)
            )
        })



    return (
        <div className="container-fluid px-4 py-4 max-w-7xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <TbRefresh className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Ciclos Reproductivos</h1>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {ciclos.length} ciclos
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Control de ciclos estrales, servicios de monta e inseminación, y seguimiento de gestación</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleNew}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all duration-200"
                >
                    <TbPlus className="w-5 h-5" />
                    <span>Nuevo Ciclo</span>
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Listado de Ciclos</h2>
                        <p className="text-xs text-gray-400">Progreso de etapas, montas, inseminaciones y calendario</p>
                    </div>
                    <div className="relative w-full sm:w-80 md:w-96 search-input-container">
                        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Buscar por ID, cerda, tipo..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columnsTable}
                    data={filteredCiclos}
                    keyField="Id_Ciclo"
                    pagination
                    responsive
                    highlightOnHover
                    striped
                    customStyles={customTableStyles}
                    noDataComponent={
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No hay ciclos registrados
                        </div>
                    }
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
            <div className="modal fade calendario-modal" ref={modalCalendarioRef} aria-hidden="true" data-bs-focus="false">
                <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down" style={{ maxWidth: '95vw', width: '95vw', margin: '1.75rem auto' }}>
                    <div className="modal-content">
                        <div className="modal-header bg-info bg-opacity-10">
                            <h5 className="modal-title">
                                {calendarioEdit ? '📅 Actualizar Calendario' : '📅 Agregar Calendario'}
                            </h5>
                            <button type="button" className="btn-close"
                                onClick={() => cerrarModal(modalCalendarioInstanceRef)}></button>
                        </div>

                        <div className="modal-body p-0">
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