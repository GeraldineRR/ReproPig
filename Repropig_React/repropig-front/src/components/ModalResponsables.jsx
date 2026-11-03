import React, { useEffect } from "react";
import { TbUsers, TbX, TbPhone, TbMail, TbId } from "react-icons/tb";

const THEMES = {
    blue: {
        headerBg: "bg-gradient-to-r from-blue-600 to-indigo-600",
        headerSub: "text-blue-100",
        avatarBg: "bg-gradient-to-tr from-blue-600 to-indigo-500",
        btnClass: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
        btnIcon: "text-blue-600",
        itemHover: "hover:bg-blue-50/50"
    },
    pink: {
        headerBg: "bg-gradient-to-r from-pink-500 to-rose-600",
        headerSub: "text-pink-100",
        avatarBg: "bg-gradient-to-tr from-pink-500 to-rose-400",
        btnClass: "bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200",
        btnIcon: "text-pink-600",
        itemHover: "hover:bg-pink-50/50"
    },
    teal: {
        headerBg: "bg-gradient-to-r from-teal-600 to-emerald-600",
        headerSub: "text-teal-100",
        avatarBg: "bg-gradient-to-tr from-teal-500 to-emerald-500",
        btnClass: "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200",
        btnIcon: "text-teal-600",
        itemHover: "hover:bg-teal-50/50"
    },
    indigo: {
        headerBg: "bg-gradient-to-r from-indigo-600 to-violet-600",
        headerSub: "text-indigo-100",
        avatarBg: "bg-gradient-to-tr from-indigo-500 to-violet-500",
        btnClass: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200",
        btnIcon: "text-indigo-600",
        itemHover: "hover:bg-indigo-50/50"
    },
    emerald: {
        headerBg: "bg-gradient-to-r from-emerald-600 to-teal-700",
        headerSub: "text-emerald-100",
        avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-600",
        btnClass: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200",
        btnIcon: "text-emerald-600",
        itemHover: "hover:bg-emerald-50/50"
    },
    purple: {
        headerBg: "bg-gradient-to-r from-purple-600 to-indigo-600",
        headerSub: "text-purple-100",
        avatarBg: "bg-gradient-to-tr from-purple-500 to-indigo-500",
        btnClass: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200",
        btnIcon: "text-purple-600",
        itemHover: "hover:bg-purple-50/50"
    },
    amber: {
        headerBg: "bg-gradient-to-r from-amber-600 to-orange-600",
        headerSub: "text-amber-100",
        avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-500",
        btnClass: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200",
        btnIcon: "text-amber-600",
        itemHover: "hover:bg-amber-50/50"
    }
};

/**
 * Botón compacto que se renderiza dentro de la columna de cualquier DataTable
 */
export const BotonResponsables = ({ lista = [], onClick, theme = "blue" }) => {
    const count = Array.isArray(lista) ? lista.length : 0;
    if (count === 0) {
        return <span className="text-gray-400 text-xs italic">Sin responsables</span>;
    }

    const t = THEMES[theme] || THEMES.blue;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs group cursor-pointer ${t.btnClass}`}
            title="Ver responsables asignados"
        >
            <TbUsers className={`${t.btnIcon} group-hover:scale-110 transition-transform text-sm`} />
            <span>
                {count} {count === 1 ? "Responsable" : "Responsables"}
            </span>
        </button>
    );
};

/**
 * Modal universal responsivo para ver el listado detallado de responsables
 */
export const ModalResponsables = ({ data, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (data) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [data, onClose]);

    if (!data) return null;

    const {
        titulo = "Responsables Asignados",
        subtitulo = "",
        responsables: lista = [],
        theme = "blue"
    } = data;

    const t = THEMES[theme] || THEMES.blue;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabecera Modal */}
                <div className={`${t.headerBg} text-white px-5 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
                            <TbUsers className="text-xl text-white" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-sm sm:text-base m-0 leading-tight truncate">
                                {titulo}
                            </h4>
                            {subtitulo && (
                                <p className={`text-[11px] sm:text-xs ${t.headerSub} m-0 truncate`}>
                                    {subtitulo}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
                        title="Cerrar"
                    >
                        <TbX size={18} />
                    </button>
                </div>

                {/* Lista de Responsables */}
                <div className="p-4 sm:p-5 max-h-80 overflow-y-auto space-y-2.5">
                    {lista.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">
                            No hay responsables asociados a este registro.
                        </p>
                    ) : (
                        lista.map((resp, idx) => {
                            const inicial = resp.Nombres
                                ? resp.Nombres.trim().charAt(0).toUpperCase()
                                : "R";
                            const nombreCompleto = `${resp.Nombres || ""} ${resp.Apellidos || ""}`.trim() || `Responsable #${resp.Id_Responsable || idx + 1}`;
                            const cargo = resp.Cargo || resp.cargo || resp.Rol || resp.rol || "Personal responsable";

                            return (
                                <div
                                    key={resp.Id_Responsable || idx}
                                    className={`flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 ${t.itemHover} border border-gray-100 transition-colors`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-xl ${t.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 mt-0.5`}
                                    >
                                        {inicial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h6 className="text-xs sm:text-sm font-bold text-gray-800 m-0 truncate">
                                            {nombreCompleto}
                                        </h6>
                                        <p className="text-[11px] text-gray-500 m-0 truncate font-medium">
                                            {cargo}
                                        </p>

                                        {/* Metadatos adicionales si existen */}
                                        <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-gray-400">
                                            {resp.Documento && (
                                                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-100 text-gray-600">
                                                    <TbId size={12} className="text-gray-400" />
                                                    Doc: {resp.Documento}
                                                </span>
                                            )}
                                            {resp.Telefono && (
                                                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-100 text-gray-600">
                                                    <TbPhone size={12} className="text-gray-400" />
                                                    {resp.Telefono}
                                                </span>
                                            )}
                                            {resp.Email && (
                                                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-100 text-gray-600 truncate max-w-[200px]">
                                                    <TbMail size={12} className="text-gray-400" />
                                                    {resp.Email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pie del modal */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">
                        Total: {lista.length} {lista.length === 1 ? "persona" : "personas"}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalResponsables;
