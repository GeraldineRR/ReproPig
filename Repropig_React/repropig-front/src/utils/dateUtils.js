/**
 * Utilidades de fecha y vigencia para ReproPig
 * Evitan desfases de zona horaria (UTC vs Local) donde el día se resta al renderizar.
 */

/**
 * Formatea una fecha (YYYY-MM-DD o ISO) de forma segura en hora local.
 * @param {string|Date} fechaStr 
 * @param {object} opciones 
 * @returns {string}
 */
export const formatearFecha = (fechaStr, opciones = { year: "numeric", month: "short", day: "numeric" }) => {
    if (!fechaStr) return "—";
    try {
        const parte = String(fechaStr).split("T")[0].split(" ")[0];
        const partes = parte.split("-");
        if (partes.length === 3) {
            const [y, m, d] = partes.map(Number);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                // Crear a mediodía local para evitar cualquier salto por huso horario
                const fechaObj = new Date(y, m - 1, d, 12, 0, 0);
                return fechaObj.toLocaleDateString("es-ES", opciones);
            }
        }
        const d = new Date(fechaStr);
        return isNaN(d.getTime()) ? String(fechaStr) : d.toLocaleDateString("es-ES", opciones);
    } catch {
        return String(fechaStr || "—");
    }
};

/**
 * Formatea la hora de una cadena de fecha/hora (ej: "14:30")
 * @param {string|Date} fechaStr 
 * @returns {string}
 */
export const formatearHora = (fechaStr) => {
    if (!fechaStr) return "";
    try {
        const str = String(fechaStr);
        if (str.includes("T")) {
            const hora = str.split("T")[1]?.slice(0, 5);
            if (hora && hora.includes(":")) return hora;
        }
        if (str.includes(" ")) {
            const hora = str.split(" ")[1]?.slice(0, 5);
            if (hora && hora.includes(":")) return hora;
        }
        const d = new Date(fechaStr);
        return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
};

/**
 * Formatea fecha y hora combinados de manera segura.
 * @param {string|Date} fechaStr 
 * @returns {{ fecha: string, hora: string }}
 */
export const formatearFechaYHora = (fechaStr) => {
    return {
        fecha: formatearFecha(fechaStr),
        hora: formatearHora(fechaStr)
    };
};

/**
 * Calcula los días restantes de vigencia de una colecta interna (vida útil: 3 días refrigerado fresco).
 * @param {string|Date} fechaStr 
 * @param {string} tipo 'Interno' | 'Externo'
 * @returns {number|null} días restantes (positivo = vigente, 0 = vence hoy, negativo = vencida)
 */
export const getDiasParaVencer = (fechaStr, tipo) => {
    if ((tipo || "Interno").toLowerCase() !== "interno" || !fechaStr) return null;
    try {
        const parte = String(fechaStr).split("T")[0].split(" ")[0];
        const [y, m, d] = parte.split("-").map(Number);
        if (!y || !m || !d) return null;

        const fechaColecta = new Date(y, m - 1, d, 0, 0, 0);
        const fechaExpira = new Date(fechaColecta);
        fechaExpira.setDate(fechaExpira.getDate() + 3);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const diffTime = fechaExpira.getTime() - hoy.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
};

/**
 * Determina el estado de vigencia y disponibilidad de una colecta.
 * El estado ya NO es manual: se deriva directamente de la vigencia y existencias.
 * @param {object} colecta 
 * @returns {object} { estado, isVencida, isAgotada, isVigente, diasVence, badgeClass, label }
 */
export const getEstadoVigenciaColecta = (colecta) => {
    const tipo = (colecta.Tipo || "Interno").toLowerCase();
    const gen = Number(colecta.cant_generada) || 0;
    const uti = Number(colecta.cant_utilizada) || 0;
    const disp = Math.max(0, gen - uti);

    if (tipo === "interno") {
        const dias = getDiasParaVencer(colecta.Fecha, colecta.Tipo);
        if (dias !== null && dias <= 0) {
            return {
                estado: "Vencida",
                isVencida: true,
                isAgotada: disp <= 0,
                isVigente: false,
                diasVence: dias,
                badgeClass: "bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-600/10",
                dotClass: "bg-red-500",
                label: "Vencida (Inactiva)"
            };
        }

        if (disp <= 0) {
            return {
                estado: "Agotada",
                isVencida: false,
                isAgotada: true,
                isVigente: false,
                diasVence: dias,
                badgeClass: "bg-gray-100 text-gray-700 border border-gray-200",
                dotClass: "bg-gray-400",
                label: "Agotada (0 disp.)"
            };
        }

        if (dias === 1) {
            return {
                estado: "Vence pronto",
                isVencida: false,
                isAgotada: false,
                isVigente: true,
                diasVence: 1,
                badgeClass: "bg-amber-50 text-amber-800 border border-amber-200 ring-1 ring-amber-600/10",
                dotClass: "bg-amber-500",
                label: "Vence hoy/mañana (1 día)"
            };
        }

        return {
            estado: "Vigente",
            isVencida: false,
            isAgotada: false,
            isVigente: true,
            diasVence: dias,
            badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-600/10",
            dotClass: "bg-emerald-500",
            label: `Vigente (${dias || 3} días)`
        };
    } else {
        // Semen de origen externo
        if (disp <= 0) {
            return {
                estado: "Agotada",
                isVencida: false,
                isAgotada: true,
                isVigente: false,
                diasVence: null,
                badgeClass: "bg-gray-100 text-gray-700 border border-gray-200",
                dotClass: "bg-gray-400",
                label: "Agotada (0 disp.)"
            };
        }

        return {
            estado: "Vigente",
            isVencida: false,
            isAgotada: false,
            isVigente: true,
            diasVence: null,
            badgeClass: "bg-purple-50 text-purple-700 border border-purple-200 ring-1 ring-purple-600/10",
            dotClass: "bg-purple-500",
            label: "Vigente (Externo)"
        };
    }
};

/**
 * Calcula la fecha programada en formato YYYY-MM-DD sumando (dia - 1) a una fecha base de nacimiento/parto,
 * garantizando cero saltos de zona horaria (UTC vs Local).
 * @param {string|Date} fechaBase 
 * @param {number|string} dia 
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const calcularFechaProgramada = (fechaBase, dia) => {
    if (!fechaBase || !dia) return '';
    try {
        const parte = String(fechaBase).split('T')[0].split(' ')[0];
        const partes = parte.split('-');
        if (partes.length !== 3) return '';
        const [y, m, d] = partes.map(Number);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return '';

        // Usamos mediodía local (12:00) para evitar desfases UTC
        const fechaObj = new Date(y, m - 1, d, 12, 0, 0);
        fechaObj.setDate(fechaObj.getDate() + (Number(dia) - 1));

        const resY = fechaObj.getFullYear();
        const resM = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const resD = String(fechaObj.getDate()).padStart(2, '0');

        return `${resY}-${resM}-${resD}`;
    } catch {
        return '';
    }
};

/**
 * Retorna la fecha programada formateada en DD/MM/AAAA para visualización directa en tablas.
 * @param {string|Date} fechaBase 
 * @param {number|string} dia 
 * @returns {string} Fecha en formato DD/MM/AAAA
 */
export const formatearFechaProgramada = (fechaBase, dia) => {
    const ymd = calcularFechaProgramada(fechaBase, dia);
    if (!ymd) return '—';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
};
