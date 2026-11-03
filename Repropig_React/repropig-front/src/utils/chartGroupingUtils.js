/**
 * Utilidades para agrupación temporal homogénea de gráficos estadísticos en ReproPig
 * (Montas, Inseminaciones, Colectas)
 * 
 * Reglas de negocio:
 * 1. "30d" (Últimos 30 días): Agrupar por SEMANAS (4 o 5 barras, cubriendo exactamente el período).
 * 2. "90d" (Últimos 90 días): Agrupar por SEMANAS (~13 barras semanales).
 * 3. "year" (Año en curso): Agrupar por MESES (12 barras mensuales de Ene a Dic).
 * 4. "custom" (Rango personalizado):
 *    - Hasta 31 días: agrupar por DÍAS.
 *    - De 32 días a 18 meses: agrupar por MESES.
 *    - Más de 18 meses: agrupar por AÑOS.
 * 5. "all" (Todo el historial):
 *    - Si no hay datos, año actual (meses).
 *    - Si rango <= 31 días: días.
 *    - Si rango <= 18 meses: meses.
 *    - Si rango > 18 meses: años.
 * 
 * Detalles indispensables:
 * - Conservar períodos (días, semanas, meses, años) sin registros con valor 0.
 * - Filtros secundarios (macho, cerda, estado, origen, etc.) son independientes: no alteran
 *   la regla de agrupación ni los intervalos temporales precalculados.
 * - El título cambia según la agrupación: «Evolución semanal de ...», «Evolución mensual de ...»,
 *   «Evolución anual de ...» o «Evolución diaria de ...».
 */

export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MESES_LARGOS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Parsea cualquier cadena de fecha o Date a un objeto Date a medianoche local segura.
 */
export const normalizarFechaLocal = (fechaStr, esFinDeDia = false) => {
    if (!fechaStr) return null;
    try {
        if (fechaStr instanceof Date) {
            if (isNaN(fechaStr.getTime())) return null;
            const d = new Date(fechaStr.getFullYear(), fechaStr.getMonth(), fechaStr.getDate());
            if (esFinDeDia) d.setHours(23, 59, 59, 999);
            else d.setHours(0, 0, 0, 0);
            return d;
        }

        const parte = String(fechaStr).split("T")[0].split(" ")[0];
        const partes = parte.split("-");
        if (partes.length === 3) {
            const [y, m, d] = partes.map(Number);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                const res = new Date(y, m - 1, d);
                if (esFinDeDia) res.setHours(23, 59, 59, 999);
                else res.setHours(0, 0, 0, 0);
                return res;
            }
        }

        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return null;
        const res = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (esFinDeDia) res.setHours(23, 59, 59, 999);
        else res.setHours(0, 0, 0, 0);
        return res;
    } catch {
        return null;
    }
};

/**
 * Determina el modo de agrupación ('semanas' | 'dias' | 'meses' | 'anos')
 * y las fechas de inicio y fin exactas para el periodo.
 */
export const resolverConfiguracionTemporal = ({
    filtroPeriodo,
    fechaDesde,
    fechaHasta,
    items = [],
    campoFecha = "Fec_hora"
}) => {
    const ahora = new Date();
    let fechaInicio;
    let fechaFin = normalizarFechaLocal(ahora, true);
    let modo = "meses";

    if (filtroPeriodo === "30d") {
        modo = "semanas";
        const lim = new Date(ahora);
        lim.setDate(ahora.getDate() - 30);
        fechaInicio = normalizarFechaLocal(lim, false);
    } else if (filtroPeriodo === "90d") {
        modo = "semanas";
        const lim = new Date(ahora);
        lim.setDate(ahora.getDate() - 90);
        fechaInicio = normalizarFechaLocal(lim, false);
    } else if (filtroPeriodo === "year") {
        modo = "meses";
        const anio = ahora.getFullYear();
        fechaInicio = new Date(anio, 0, 1, 0, 0, 0, 0);
        fechaFin = new Date(anio, 11, 31, 23, 59, 59, 999);
    } else if (filtroPeriodo === "custom") {
        const dInicio = normalizarFechaLocal(fechaDesde, false);
        const dFin = normalizarFechaLocal(fechaHasta, true);

        if (dInicio && dFin && dInicio <= dFin) {
            fechaInicio = dInicio;
            fechaFin = dFin;
        } else if (dInicio) {
            fechaInicio = dInicio;
            fechaFin = normalizarFechaLocal(ahora, true);
        } else {
            // Si no hay fechas definidas aún en custom, tomamos los últimos 30 días como fallback inicial
            const lim = new Date(ahora);
            lim.setDate(ahora.getDate() - 30);
            fechaInicio = normalizarFechaLocal(lim, false);
        }

        // Calcular duración
        const diffMs = fechaFin.getTime() - fechaInicio.getTime();
        const dias = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
        const meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaFin.getMonth() - fechaInicio.getMonth()) + 1;

        if (dias <= 31) {
            modo = "dias";
        } else if (meses <= 18) {
            modo = "meses";
        } else {
            modo = "anos";
        }
    } else {
        // 'all' o cualquier otro valor
        // Buscar extremos en los items
        let minTime = Infinity;
        let maxTime = -Infinity;

        items.forEach((item) => {
            const f = normalizarFechaLocal(item[campoFecha]);
            if (f) {
                const t = f.getTime();
                if (t < minTime) minTime = t;
                if (t > maxTime) maxTime = t;
            }
        });

        if (minTime !== Infinity && maxTime !== -Infinity) {
            fechaInicio = new Date(minTime);
            fechaInicio.setHours(0, 0, 0, 0);
            fechaFin = new Date(maxTime);
            fechaFin.setHours(23, 59, 59, 999);

            const diffMs = fechaFin.getTime() - fechaInicio.getTime();
            const dias = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
            const meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaFin.getMonth() - fechaInicio.getMonth()) + 1;

            if (dias <= 31) {
                modo = "dias";
            } else if (meses <= 18) {
                modo = "meses";
            } else {
                modo = "anos";
            }
        } else {
            // Sin datos: año actual
            modo = "meses";
            const anio = ahora.getFullYear();
            fechaInicio = new Date(anio, 0, 1, 0, 0, 0, 0);
            fechaFin = new Date(anio, 11, 31, 23, 59, 59, 999);
        }
    }

    return { modo, fechaInicio, fechaFin };
};

/**
 * Genera el título según el modo y la entidad.
 * Ejemplo: «Evolución semanal de montas», «Evolución mensual de inseminaciones», «Evolución anual de colectas».
 */
export const obtenerTituloEvolucion = (entidad = "montas", modo = "meses") => {
    const mapaTitulos = {
        semanas: `Evolución semanal de ${entidad}`,
        meses: `Evolución mensual de ${entidad}`,
        anos: `Evolución anual de ${entidad}`,
        dias: `Evolución diaria de ${entidad}`
    };
    return mapaTitulos[modo] || `Evolución de ${entidad}`;
};

/**
 * Genera un subtítulo descriptivo contextual.
 */
export const obtenerSubtituloEvolucion = (entidad = "montas", modo = "meses") => {
    const mapaSubtitulos = {
        semanas: `Actividad agrupada por semanas consecutivas`,
        meses: `Frecuencia y ritmo registrado mes a mes`,
        anos: `Tendencia histórica y comparativa anual`,
        dias: `Comportamiento diario detallado`
    };
    return mapaSubtitulos[modo] || `Registros en el periodo seleccionado`;
};

/**
 * Genera los intervalos/buckets vacíos inicializados con valor cero
 * garantizando que los períodos sin registros aparezcan en el eje.
 */
export const generarBucketsVacios = ({ modo, fechaInicio, fechaFin, camposIniciales = {} }) => {
    const buckets = [];
    if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) return buckets;

    if (modo === "semanas") {
        const totalDias = Math.round((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const esPeriodoLargoSemanas = totalDias > 35; // Más de 5 semanas (~90 días)

        let actual = new Date(fechaInicio);
        actual.setHours(0, 0, 0, 0);
        let semIdx = 1;

        while (actual <= fechaFin) {
            const semInicio = new Date(actual);
            semInicio.setHours(0, 0, 0, 0);

            const semFin = new Date(actual);
            semFin.setDate(semFin.getDate() + 6);
            semFin.setHours(23, 59, 59, 999);

            if (semFin > fechaFin) {
                semFin.setTime(fechaFin.getTime());
            }

            // Etiquetas
            const mesIni = MESES_CORTOS[semInicio.getMonth()];
            const mesFinStr = MESES_CORTOS[semFin.getMonth()];
            const diaIni = semInicio.getDate();
            const diaFin = semFin.getDate();

            // En períodos con muchas semanas (como 90 días, ~13 barras), etiqueta compacta:
            // "Sem X (14 Jul)" en vez de rangos largos horizontales que colisionan
            const labelCorto = esPeriodoLargoSemanas
                ? `Sem ${semIdx} (${diaIni} ${mesIni})`
                : (mesIni === mesFinStr 
                    ? `${diaIni}-${diaFin} ${mesIni}` 
                    : `${diaIni} ${mesIni} - ${diaFin} ${mesFinStr}`);
            
            const fullLabel = `Semana ${semIdx} (${diaIni} ${mesIni} - ${diaFin} ${mesFinStr})`;

            buckets.push({
                key: `sem-${semIdx}-${semInicio.toISOString().slice(0, 10)}`,
                index: semIdx,
                label: labelCorto,
                fullLabel,
                semInicio,
                semFin,
                cantidad: 0,
                ...camposIniciales
            });

            actual = new Date(semFin);
            actual.setDate(actual.getDate() + 1);
            actual.setHours(0, 0, 0, 0);
            semIdx++;
        }
    } else if (modo === "dias") {
        let actual = new Date(fechaInicio);
        actual.setHours(0, 0, 0, 0);

        while (actual <= fechaFin) {
            const y = actual.getFullYear();
            const m = actual.getMonth();
            const d = actual.getDate();

            const diaInicio = new Date(y, m, d, 0, 0, 0, 0);
            const diaFin = new Date(y, m, d, 23, 59, 59, 999);

            const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const label = `${d} ${MESES_CORTOS[m]}`;
            const fullLabel = `${d} de ${MESES_LARGOS[m]} de ${y}`;

            buckets.push({
                key,
                label,
                fullLabel,
                semInicio: diaInicio,
                semFin: diaFin,
                cantidad: 0,
                ...camposIniciales
            });

            actual.setDate(actual.getDate() + 1);
        }
    } else if (modo === "meses") {
        let curYear = fechaInicio.getFullYear();
        let curMonth = fechaInicio.getMonth();
        const endYear = fechaFin.getFullYear();
        const endMonth = fechaFin.getMonth();

        while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
            const mesInicio = new Date(curYear, curMonth, 1, 0, 0, 0, 0);
            const mesFin = new Date(curYear, curMonth + 1, 0, 23, 59, 59, 999);

            const key = `${curYear}-${String(curMonth + 1).padStart(2, "0")}`;
            const label = `${MESES_CORTOS[curMonth]} ${String(curYear).slice(-2)}`;
            const fullLabel = `${MESES_LARGOS[curMonth]} ${curYear}`;

            buckets.push({
                key,
                label,
                fullLabel,
                semInicio: mesInicio,
                semFin: mesFin,
                cantidad: 0,
                ...camposIniciales
            });

            curMonth++;
            if (curMonth > 11) {
                curMonth = 0;
                curYear++;
            }
        }
    } else if (modo === "anos") {
        const startYear = fechaInicio.getFullYear();
        const endYear = fechaFin.getFullYear();

        for (let y = startYear; y <= endYear; y++) {
            const anioInicio = new Date(y, 0, 1, 0, 0, 0, 0);
            const anioFin = new Date(y, 11, 31, 23, 59, 59, 999);

            const key = String(y);
            const label = String(y);
            const fullLabel = `Año ${y}`;

            buckets.push({
                key,
                label,
                fullLabel,
                semInicio: anioInicio,
                semFin: anioFin,
                cantidad: 0,
                ...camposIniciales
            });
        }
    }

    return buckets;
};

/**
 * Agrupa los elementos filtrados dentro de los buckets temporales.
 * 
 * @param {Array} items - Elementos ya filtrados por los demás filtros (macho, cerda, etc.)
 * @param {string} campoFecha - Nombre del campo de fecha en el objeto ('Fec_hora' | 'Fecha')
 * @param {object} configPeriodo - { filtroPeriodo, fechaDesde, fechaHasta }
 * @param {string} entidad - 'montas' | 'inseminaciones' | 'colectas'
 * @param {Array} camposSuma - Array opcional de [{ campo: string, destino: string }] para sumar métricas adicionales
 * @returns {object} { datos, titulo, subtitulo, modo, fechaInicio, fechaFin }
 */
export const agruparDatosEvolucion = ({
    items = [],
    campoFecha = "Fec_hora",
    configPeriodo = {},
    entidad = "montas",
    camposSuma = []
}) => {
    const { modo, fechaInicio, fechaFin } = resolverConfiguracionTemporal({
        filtroPeriodo: configPeriodo.filtroPeriodo,
        fechaDesde: configPeriodo.fechaDesde,
        fechaHasta: configPeriodo.fechaHasta,
        items,
        campoFecha
    });

    const camposIniciales = {};
    camposSuma.forEach((cs) => {
        camposIniciales[cs.destino] = 0;
    });

    const buckets = generarBucketsVacios({
        modo,
        fechaInicio,
        fechaFin,
        camposIniciales
    });

    // Asignar cada registro al bucket correspondiente
    items.forEach((item) => {
        const f = normalizarFechaLocal(item[campoFecha]);
        if (!f) return;
        const time = f.getTime();

        for (let i = 0; i < buckets.length; i++) {
            const b = buckets[i];
            if (time >= b.semInicio.getTime() && time <= b.semFin.getTime()) {
                b.cantidad += 1;
                camposSuma.forEach((cs) => {
                    const val = Number(item[cs.campo]) || 0;
                    b[cs.destino] = (b[cs.destino] || 0) + val;
                });
                break;
            }
        }
    });

    const titulo = obtenerTituloEvolucion(entidad, modo);
    const subtitulo = obtenerSubtituloEvolucion(entidad, modo);

    return {
        datos: buckets,
        titulo,
        subtitulo,
        modo,
        fechaInicio,
        fechaFin
    };
};
