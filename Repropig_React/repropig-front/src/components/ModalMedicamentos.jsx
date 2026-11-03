import React, { useEffect } from "react";
import { TbVaccine, TbX, TbPill, TbNotes, TbTag } from "react-icons/tb";

const THEMES = {
    blue: {
        headerBg: "bg-gradient-to-r from-blue-600 to-cyan-600",
        headerSub: "text-blue-100",
        avatarBg: "bg-gradient-to-tr from-blue-600 to-cyan-500",
        btnClass: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
        btnIcon: "text-blue-600",
        itemHover: "hover:bg-blue-50/50"
    },
    teal: {
        headerBg: "bg-gradient-to-r from-teal-600 to-emerald-600",
        headerSub: "text-teal-100",
        avatarBg: "bg-gradient-to-tr from-teal-500 to-emerald-500",
        btnClass: "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200",
        btnIcon: "text-teal-600",
        itemHover: "hover:bg-teal-50/50"
    },
    purple: {
        headerBg: "bg-gradient-to-r from-purple-600 to-indigo-600",
        headerSub: "text-purple-100",
        avatarBg: "bg-gradient-to-tr from-purple-500 to-indigo-500",
        btnClass: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200",
        btnIcon: "text-purple-600",
        itemHover: "hover:bg-purple-50/50"
    }
};

/**
 * Normaliza y obtiene el listado de objetos Medicamento a partir de los IDs
 */
export const getListaMedicamentos = (val, catalogoMedicamentos = []) => {
    if (!val) return [];
    let ids = [];
    if (Array.isArray(val)) {
        ids = val.map(String).filter(Boolean);
    } else if (typeof val === "number") {
        ids = [String(val)];
    } else if (typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) ids = parsed.map(String).filter(Boolean);
            } catch {
                ids = [];
            }
        } else if (trimmed.includes(",")) {
            ids = trimmed.split(",").map(x => x.trim()).filter(Boolean);
        } else if (trimmed.length > 0) {
            ids = [trimmed];
        }
    }

    if (!ids.length) return [];
    const catalogo = Array.isArray(catalogoMedicamentos) ? catalogoMedicamentos : [];

    return ids.map((id) => {
        const encontrado = catalogo.find(
            (m) => String(m.Id_Medicamento) === String(id)
        );
        if (encontrado) return encontrado;
        return {
            Id_Medicamento: id,
            Nombre: `Medicamento #${id}`,
            Tipo: "General",
            Presentacion: "—",
            Observaciones: null
        };
    });
};

/**
 * Botón compacto para la columna de DataTable
 */
export const BotonMedicamentos = ({ lista = [], onClick, theme = "blue" }) => {
    const count = Array.isArray(lista) ? lista.length : 0;
    if (count === 0) {
        return <span className="text-gray-400 text-xs italic">Sin medicamentos</span>;
    }

    const t = THEMES[theme] || THEMES.blue;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs group cursor-pointer ${t.btnClass}`}
            title="Ver medicamentos aplicados"
        >
            <TbVaccine className={`${t.btnIcon} group-hover:scale-110 transition-transform text-sm`} />
            <span>
                {count} {count === 1 ? "Medicamento" : "Medicamentos"}
            </span>
        </button>
    );
};

/**
 * Modal universal para ver el listado detallado de medicamentos aplicados
 */
export const ModalMedicamentos = ({ data, onClose }) => {
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
        titulo = "Medicamentos Aplicados",
        subtitulo = "",
        medicamentos: lista = [],
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
                            <TbVaccine className="text-xl text-white" />
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

                {/* Lista de Medicamentos */}
                <div className="p-4 sm:p-5 max-h-80 overflow-y-auto space-y-2.5">
                    {lista.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">
                            No hay medicamentos aplicados a este seguimiento.
                        </p>
                    ) : (
                        lista.map((med, idx) => {
                            const tipo = med.Tipo || "General";
                            return (
                                <div
                                    key={med.Id_Medicamento || idx}
                                    className={`flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 ${t.itemHover} border border-gray-100 transition-colors`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-xl ${t.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 mt-0.5`}
                                    >
                                        <TbPill className="text-base" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h6 className="text-xs sm:text-sm font-bold text-gray-800 m-0 truncate">
                                                {med.Nombre}
                                            </h6>
                                            {tipo && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                                                    {tipo}
                                                </span>
                                            )}
                                        </div>

                                        {/* Metadatos si existen */}
                                        <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-gray-500">
                                            {med.Presentacion && (
                                                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-100 text-gray-600">
                                                    <TbTag size={12} className="text-gray-400" />
                                                    {med.Presentacion}
                                                </span>
                                            )}
                                            {med.Unidad_Medida && (
                                                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-100 text-gray-600">
                                                    Unidad: {med.Unidad_Medida}
                                                </span>
                                            )}
                                        </div>

                                        {med.Observaciones && (
                                            <p className="text-[11px] text-gray-500 m-0 mt-1 italic line-clamp-2">
                                                {med.Observaciones}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pie del modal */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">
                        Total: {lista.length} {lista.length === 1 ? "medicamento" : "medicamentos"}
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

export default ModalMedicamentos;
