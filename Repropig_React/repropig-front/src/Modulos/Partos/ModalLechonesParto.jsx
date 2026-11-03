import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { formatearFecha } from "../../utils/dateUtils";
import {
    TbPig,
    TbX,
    TbDeviceFloppy,
    TbCalendar,
    TbScale,
    TbGenderMale,
    TbGenderFemale,
    TbNotes,
    TbTag,
    TbCheck
} from "react-icons/tb";

const MySwal = withReactContent(Swal);

export default function ModalLechonesParto({ isOpen, onClose, parto, onUpdated }) {
    const [lechones, setLechones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [guardandoId, setGuardandoId] = useState(null);
    const [guardandoTodos, setGuardandoTodos] = useState(false);
    const [cambiosPendientes, setCambiosPendientes] = useState({});

    useEffect(() => {
        if (isOpen && parto?.Id_parto) {
            cargarLechones();
        } else {
            setLechones([]);
            setCambiosPendientes({});
        }
    }, [isOpen, parto]);

    const cargarLechones = async () => {
        try {
            setCargando(true);
            const res = await apiAxios.get(`/porcino/lechones/parto/${parto.Id_parto}`);
            const data = Array.isArray(res.data) ? res.data : [];

            const mapeados = data.map(l => ({
                ...l,
                editObservaciones: l.Observaciones || '',
                guardadoReciente: false
            }));

            setLechones(mapeados);
            setCambiosPendientes({});
        } catch (error) {
            console.error("Error cargando lechones:", error);
            MySwal.fire({
                icon: "error",
                title: "Error al cargar",
                text: "No se pudieron obtener los lechones registrados de este parto."
            });
        } finally {
            setCargando(false);
        }
    };

    const handleObservacionesChange = (idPorcino, valor) => {
        setLechones(prev =>
            prev.map(l => {
                if (l.Id_Porcino === idPorcino) {
                    return { ...l, editObservaciones: valor, guardadoReciente: false };
                }
                return l;
            })
        );
        setCambiosPendientes(prev => ({
            ...prev,
            [idPorcino]: true
        }));
    };

    const guardarLechon = async (lechon) => {
        try {
            setGuardandoId(lechon.Id_Porcino);
            const payload = {
                Observaciones: lechon.editObservaciones || null
            };

            await apiAxios.put(`/porcino/${lechon.Id_Porcino}`, payload);

            setLechones(prev =>
                prev.map(l => {
                    if (l.Id_Porcino === lechon.Id_Porcino) {
                        return {
                            ...l,
                            Observaciones: payload.Observaciones,
                            guardadoReciente: true
                        };
                    }
                    return l;
                })
            );

            setCambiosPendientes(prev => {
                const copia = { ...prev };
                delete copia[lechon.Id_Porcino];
                return copia;
            });

            if (onUpdated) onUpdated();

            MySwal.fire({
                icon: "success",
                title: "¡Guardado!",
                text: `Observaciones del lechón #${lechon.Id_Porcino} actualizadas correctamente.`,
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error actualizando observaciones del lechón:", error);
            MySwal.fire({
                icon: "error",
                title: "Error al guardar",
                text: error.response?.data?.message || "No se pudieron actualizar las observaciones del lechón."
            });
        } finally {
            setGuardandoId(null);
        }
    };

    const guardarTodos = async () => {
        try {
            setGuardandoTodos(true);
            const pendientesList = lechones.filter(l => cambiosPendientes[l.Id_Porcino]);

            if (pendientesList.length === 0) {
                MySwal.fire({
                    icon: "info",
                    title: "Sin cambios pendientes",
                    text: "No hay modificaciones en las observaciones para guardar.",
                    toast: true,
                    position: "top-end",
                    timer: 2000,
                    showConfirmButton: false
                });
                return;
            }

            let guardadosCount = 0;
            for (const lechon of pendientesList) {
                const payload = {
                    Observaciones: lechon.editObservaciones || null
                };

                await apiAxios.put(`/porcino/${lechon.Id_Porcino}`, payload);
                guardadosCount++;
            }

            setLechones(prev =>
                prev.map(l => ({
                    ...l,
                    Observaciones: l.editObservaciones || null,
                    guardadoReciente: Boolean(cambiosPendientes[l.Id_Porcino])
                }))
            );

            setCambiosPendientes({});
            if (onUpdated) onUpdated();

            MySwal.fire({
                icon: "success",
                title: "¡Observaciones guardadas!",
                text: `Se actualizaron las observaciones de ${guardadosCount} ${guardadosCount === 1 ? 'lechón' : 'lechones'}.`,
                toast: true,
                position: "top-end",
                timer: 2500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error guardando observaciones en lote:", error);
            MySwal.fire({
                icon: "error",
                title: "Error al guardar",
                text: error.response?.data?.message || "Ocurrió un error al guardar las observaciones."
            });
        } finally {
            setGuardandoTodos(false);
        }
    };

    if (!isOpen) return null;

    const nombreMadre = parto?.porcino?.Nom_Porcino || parto?.porcino?.Num_Chapeta || `Cerda #${parto?.Id_Porcino || '—'}`;
    const hayCambios = Object.keys(cambiosPendientes).length > 0;
    const machosCount = lechones.filter(l => l.Gen_Porcino === 'M').length;
    const hembrasCount = lechones.filter(l => l.Gen_Porcino === 'H' || l.Gen_Porcino === 'F').length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            style={{ zIndex: 1060 }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner">
                            <TbPig className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight m-0">
                                    Lechones del Parto #{parto?.Id_parto}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/25 text-white border border-white/30">
                                    {lechones.length} {lechones.length === 1 ? 'lechón' : 'lechones'}
                                </span>
                            </div>
                            <p className="text-pink-100 text-xs sm:text-sm font-medium m-0 mt-0.5">
                                Madre: <strong className="text-white">{nombreMadre}</strong> • Fecha Parto: <span className="text-white font-semibold">{formatearFecha(parto?.Fec_inicio)}</span> • Vivos: <span className="text-white font-semibold">{parto?.Nac_vivos || '—'}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-150 cursor-pointer border-0"
                        title="Cerrar modal"
                    >
                        <TbX className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-header / Metrics / Acciones */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-semibold">Distribución:</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <TbGenderMale className="w-3.5 h-3.5" />
                            {machosCount} {machosCount === 1 ? 'Macho' : 'Machos'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
                            <TbGenderFemale className="w-3.5 h-3.5" />
                            {hembrasCount} {hembrasCount === 1 ? 'Hembra' : 'Hembras'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={guardarTodos}
                            disabled={guardandoTodos || cargando || lechones.length === 0 || !hayCambios}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg text-white transition-all shadow-sm flex items-center gap-1.5 border-0 ${hayCambios
                                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/40 cursor-pointer animate-pulse'
                                : 'bg-slate-400 cursor-not-allowed opacity-60'
                                }`}
                            title={hayCambios ? "Guardar cambios en observaciones" : "No hay cambios pendientes"}
                        >
                            <TbDeviceFloppy className="w-4 h-4" />
                            <span>{guardandoTodos ? "Guardando..." : "Guardar Observaciones"}</span>
                        </button>
                    </div>
                </div>

                {/* Body Table */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                    {cargando ? (
                        <div className="py-20 text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                            <p className="mt-3 text-slate-500 font-medium text-sm">Cargando lechones del parto...</p>
                        </div>
                    ) : lechones.length === 0 ? (
                        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
                            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto text-3xl mb-3 shadow-inner">
                                <TbPig className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-slate-700 text-base mb-1">No hay lechones registrados</h4>
                            <p className="text-slate-500 text-xs max-w-sm mx-auto">
                                No se encontraron lechones activos asociados a este parto (#{parto?.Id_parto}).
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-extrabold tracking-wider text-[11px]">
                                            <th className="py-3 px-3">Nombre</th>
                                            <th className="py-3 px-3">
                                                <div className="flex items-center gap-1">
                                                    <TbTag className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Chapeta</span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-3">
                                                <div className="flex items-center gap-1">
                                                    <TbCalendar className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Fecha Nacimiento</span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-3 text-center">Sexo</th>
                                            <th className="py-3 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <TbScale className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Peso Nacer</span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-3">
                                                <div className="flex items-center gap-1">
                                                    <TbNotes className="w-3.5 h-3.5 text-pink-600" />
                                                    <span>Observaciones (Editable)</span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-2 text-center w-14">Guardar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {lechones.map((lechon, idx) => {
                                            const isMacho = lechon.Gen_Porcino === 'M';
                                            const isSavingThis = guardandoId === lechon.Id_Porcino;
                                            const isPending = Boolean(cambiosPendientes[lechon.Id_Porcino]);

                                            return (
                                                <tr
                                                    key={lechon.Id_Porcino}
                                                    className={`hover:bg-slate-50/80 transition-colors ${lechon.guardadoReciente
                                                        ? 'bg-emerald-50/30'
                                                        : isPending
                                                            ? 'bg-amber-50/30'
                                                            : ''
                                                        }`}
                                                >
                                                    {/* Nombre */}
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        <span className="font-semibold text-slate-800 text-xs">
                                                            {lechon.Nom_Porcino || `Lechón #${idx + 1}`}
                                                        </span>
                                                    </td>

                                                    {/* Chapeta */}
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        {lechon.Num_Chapeta ? (
                                                            <span className="font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full text-xs font-mono">
                                                                {lechon.Num_Chapeta}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-xs">Sin chapeta</span>
                                                        )}
                                                    </td>

                                                    {/* Fecha Nacimiento */}
                                                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium text-xs">
                                                        {formatearFecha(lechon.Fec_Nac_Porcino || parto?.Fec_inicio)}
                                                    </td>

                                                    {/* Sexo */}
                                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isMacho
                                                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                                : "bg-pink-100 text-pink-700 border border-pink-200"
                                                                }`}
                                                        >
                                                            {isMacho ? <TbGenderMale className="w-3 h-3" /> : <TbGenderFemale className="w-3 h-3" />}
                                                            {isMacho ? "Macho" : "Hembra"}
                                                        </span>
                                                    </td>

                                                    {/* Peso Nacer */}
                                                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-semibold text-slate-700 text-xs">
                                                        {lechon.Pes_Nacer ? `${Number(lechon.Pes_Nacer).toFixed(2)} kg` : '—'}
                                                    </td>

                                                    {/* Observaciones (Editable) */}
                                                    <td className="py-2.5 px-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Notas u observaciones del lechón..."
                                                            value={lechon.editObservaciones ?? ''}
                                                            onChange={e => handleObservacionesChange(lechon.Id_Porcino, e.target.value)}
                                                            className={`w-full min-w-[220px] px-2.5 py-1.5 text-xs rounded-lg border outline-none font-medium transition-all ${isPending
                                                                ? 'border-pink-500 bg-pink-50/20 text-slate-800 ring-1 ring-pink-300'
                                                                : 'border-slate-300 bg-white text-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-400'
                                                                }`}
                                                        />
                                                    </td>

                                                    {/* Guardar Individual */}
                                                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => guardarLechon(lechon)}
                                                            disabled={isSavingThis || !isPending}
                                                            title={isPending ? "Guardar cambios de este lechón" : "Sin cambios pendientes"}
                                                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all inline-flex items-center justify-center ${isPending
                                                                ? 'bg-pink-600 hover:bg-pink-700 text-white border-pink-700 shadow-xs cursor-pointer'
                                                                : lechon.guardadoReciente
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default'
                                                                    : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-60'
                                                                }`}
                                                        >
                                                            {isSavingThis ? (
                                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : lechon.guardadoReciente && !isPending ? (
                                                                <TbCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                            ) : (
                                                                <TbDeviceFloppy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-1.5">
                        💡 <span>Los datos del lechón son de solo lectura. El único campo editable son las <strong>observaciones</strong>.</span>
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
