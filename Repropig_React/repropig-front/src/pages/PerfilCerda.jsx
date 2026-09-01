import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../api/axiosConfig"

const fmtFecha = (valor) => {
    if (!valor) return "—"
    const raw = String(valor).split("T")[0]
    const parts = raw.split("-")
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    return String(valor).slice(0, 16).replace("T", " ")
}

const fmtFechaHora = (valor) => {
    if (!valor) return "—"
    const s = String(valor)
    if (s.includes("T")) {
        const [f, t] = s.split("T")
        const parts = f.split("-")
        const hora = (t || "").slice(0, 5)
        return `${parts[2]}/${parts[1]}/${parts[0]}${hora ? ` ${hora}` : ""}`
    }
    return s
}

const toSortKey = (valor) => {
    if (!valor) return ""
    return String(valor).replace("T", " ").slice(0, 19)
}

function GraficoHistorialPartos({ partos, forPdf = false }) {
    const datos = useMemo(() => {
        return [...partos]
            .sort((a, b) => String(a.Fec_inicio || "").localeCompare(String(b.Fec_inicio || "")))
            .map((p, i) => ({
                label: fmtFecha(p.Fec_inicio) || `#${i + 1}`,
                vivos: Number(p.Nac_vivos) || 0,
                muertos: Number(p.Nac_muertos) || 0,
                momias: Number(p.Nac_momias) || 0,
            }))
    }, [partos])

    if (datos.length === 0) {
        return (
            <div className={forPdf ? "pdf-empty" : "text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200"}>
                <p className={forPdf ? undefined : "text-gray-500 font-medium"}>Sin datos para graficar.</p>
            </div>
        )
    }

    const w = forPdf ? 720 : 640
    const h = forPdf ? 200 : 220
    const pad = { top: 20, right: 12, bottom: 36, left: 34 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom
    const maxY = Math.max(1, ...datos.flatMap((d) => [d.vivos, d.muertos, d.momias]))
    const groupW = chartW / datos.length
    const barW = Math.min(16, groupW / 4)
    const yScale = (v) => pad.top + chartH - (v / maxY) * chartH
    const series = [
        { key: "vivos", color: "#15803d", label: "Vivos" },
        { key: "muertos", color: "#b91c1c", label: "Muertos" },
        { key: "momias", color: "#a16207", label: "Momias" },
    ]

    return (
        <div className={forPdf ? undefined : "w-full overflow-x-auto"}>
            <svg viewBox={`0 0 ${w} ${h}`} width={forPdf ? w : "100%"} height={forPdf ? h : undefined} style={forPdf ? { display: "block", maxWidth: "100%" } : undefined} className={forPdf ? undefined : "w-full max-w-full min-w-[480px]"} role="img" aria-label="Historial de partos">
                {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                    const y = pad.top + chartH * (1 - t)
                    const val = Math.round(maxY * t)
                    return (
                        <g key={t}>
                            <line x1={pad.left} x2={w - pad.right} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                            <text x={pad.left - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7280">{val}</text>
                        </g>
                    )
                })}
                {datos.map((d, i) => {
                    const cx = pad.left + groupW * i + groupW / 2
                    return (
                        <g key={i}>
                            {series.map((s, si) => {
                                const val = d[s.key]
                                const bh = (val / maxY) * chartH
                                const x = cx - (series.length * barW) / 2 + si * barW
                                return (
                                    <rect
                                        key={s.key}
                                        x={x}
                                        y={yScale(val)}
                                        width={Math.max(barW - 2, 4)}
                                        height={Math.max(bh, val > 0 ? 2 : 0)}
                                        fill={s.color}
                                        rx="1"
                                    />
                                )
                            })}
                            <text x={cx} y={h - 10} textAnchor="middle" fontSize="9" fill="#374151">
                                {d.label}
                            </text>
                        </g>
                    )
                })}
            </svg>
            <div style={forPdf ? { display: "flex", gap: 16, justifyContent: "center", marginTop: 6, fontSize: 11, color: "#374151" } : undefined} className={forPdf ? undefined : "flex flex-wrap gap-4 justify-center mt-2 text-xs font-semibold text-gray-600"}>
                {series.map((s) => (
                    <span key={s.key} style={forPdf ? { display: "inline-flex", alignItems: "center", gap: 6 } : undefined} className={forPdf ? undefined : "inline-flex items-center gap-1.5"}>
                        <span style={{ width: 10, height: 10, background: s.color, display: "inline-block" }} className={forPdf ? undefined : "w-3 h-3 rounded-sm"} />
                        {s.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

function PdfSeccion({ n, titulo, children }) {
    return (
        <section style={{ marginBottom: 18, pageBreakInside: "avoid" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "2px solid #1f2937", paddingBottom: 4, marginBottom: 8 }}>
                <span style={{ background: "#1f2937", color: "#fff", fontSize: 11, fontWeight: 700, width: 22, height: 22, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {n}
                </span>
                <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: 0.3, textTransform: "uppercase" }}>
                    {titulo}
                </h2>
            </div>
            {children}
        </section>
    )
}

function PdfTabla({ headers, rows, empty }) {
    if (!rows.length) {
        return <p style={{ margin: 0, fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>{empty}</p>
    }
    return (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, tableLayout: "fixed" }}>
            <thead>
                <tr>
                    {headers.map((h) => (
                        <th
                            key={h}
                            style={{
                                textAlign: "left",
                                background: "#f3f4f6",
                                border: "1px solid #d1d5db",
                                padding: "5px 6px",
                                fontWeight: 700,
                                color: "#374151",
                                textTransform: "uppercase",
                                fontSize: 9,
                            }}
                        >
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                        {row.map((cell, j) => (
                            <td key={j} style={{ border: "1px solid #e5e7eb", padding: "4px 6px", color: "#1f2937", verticalAlign: "top", wordBreak: "break-word" }}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function DocumentoPDFHojaVida({ porcino, ciclos, partos, novedades, seguimientos, montasTodas, inseminacionesTodas, historialCronologico }) {
    const cicloEstado = (c) => (c.Estado === "Activo" || c.Activo === "S" ? "Activo" : c.Estado || "Inactivo")

    return (
        <div
            style={{
                width: 794,
                background: "#ffffff",
                color: "#111827",
                fontFamily: "Arial, Helvetica, sans-serif",
                padding: 28,
                boxSizing: "border-box",
            }}
        >
            {/* Encabezado institucional */}
            <header style={{ borderBottom: "3px solid #be185d", paddingBottom: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <div style={{ fontSize: 11, color: "#be185d", fontWeight: 700, letterSpacing: 1.5 }}>REPROPIG · UNIDAD PORCINA</div>
                        <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#111827" }}>Hoja de vida reproductiva</h1>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4b5563" }}>Historial clínico y de producción</p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 10, color: "#6b7280", lineHeight: 1.5 }}>
                        <div>Fecha de emisión</div>
                        <div style={{ fontWeight: 700, color: "#111827", fontSize: 12 }}>{fmtFecha(new Date().toISOString())}</div>
                        <div>ID animal: {porcino.Id_Porcino}</div>
                    </div>
                </div>
            </header>

            {/* Identificación */}
            <PdfSeccion n="1" titulo="Identificación del animal">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "50%", border: "1px solid #e5e7eb", padding: 8, background: "#fdf2f8" }}>
                                <div style={{ fontSize: 9, color: "#9d174d", fontWeight: 700 }}>NOMBRE</div>
                                <div style={{ fontWeight: 800, fontSize: 15 }}>{porcino.Nom_Porcino}</div>
                            </td>
                            <td style={{ width: "50%", border: "1px solid #e5e7eb", padding: 8, background: "#fdf2f8" }}>
                                <div style={{ fontSize: 9, color: "#9d174d", fontWeight: 700 }}>CHAPETA</div>
                                <div style={{ fontWeight: 800, fontSize: 15 }}>{porcino.Num_Chapeta}</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: "1px solid #e5e7eb", padding: "6px 8px" }}><b>Raza:</b> {porcino.razas?.Nom_Raza || "—"}</td>
                            <td style={{ border: "1px solid #e5e7eb", padding: "6px 8px" }}><b>Placa SENA:</b> {porcino.Plac_Sena_Porcino || "—"}</td>
                        </tr>
                        <tr>
                            <td style={{ border: "1px solid #e5e7eb", padding: "6px 8px" }}><b>Nacimiento:</b> {fmtFecha(porcino.Fec_Nac_Porcino)}</td>
                            <td style={{ border: "1px solid #e5e7eb", padding: "6px 8px" }}><b>Llegada:</b> {fmtFecha(porcino.Fec_Llegada)}</td>
                        </tr>
                        <tr>
                            <td style={{ border: "1px solid #e5e7eb", padding: "6px 8px" }}><b>Peso inicial:</b> {porcino.Peso_Llegada != null ? `${porcino.Peso_Llegada} kg` : "—"}</td>
                            <td style={{ border: "1px solid #e5e7eb", padding: "6px 8px" }}>
                                <b>Origen:</b> {[porcino.Proc_Porcino, porcino.Lug_Proc_Porcino].filter(Boolean).join(" · ") || "—"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </PdfSeccion>

            {/* Resumen */}
            <PdfSeccion n="2" titulo="Resumen de registros">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "center" }}>
                    <thead>
                        <tr style={{ background: "#111827", color: "#fff" }}>
                            {["Ciclos", "Montas", "Inseminaciones", "Partos", "Seguimientos", "Novedades"].map((h) => (
                                <th key={h} style={{ padding: "6px 4px", border: "1px solid #111827", fontWeight: 600, fontSize: 9 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {[ciclos.length, montasTodas.length, inseminacionesTodas.length, partos.length, seguimientos.length, novedades.length].map((v, i) => (
                                <td key={i} style={{ padding: "8px 4px", border: "1px solid #d1d5db", fontWeight: 800, fontSize: 16 }}>{v}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </PdfSeccion>

            {/* Gráfico */}
            <PdfSeccion n="3" titulo="Gráfico de historial de partos">
                <div style={{ border: "1px solid #e5e7eb", padding: 10, background: "#fafafa" }}>
                    <GraficoHistorialPartos partos={partos} forPdf />
                </div>
            </PdfSeccion>

            {/* Historial cronológico unificado */}
            <PdfSeccion n="4" titulo="Historial cronológico (todas las actividades)">
                <PdfTabla
                    headers={["Fecha", "Tipo", "Detalle", "Referencia"]}
                    empty="No hay actividades registradas."
                    rows={historialCronologico.map((ev) => [ev.fecha, ev.tipo, ev.detalle, ev.ref])}
                />
            </PdfSeccion>

            {/* Ciclos */}
            <PdfSeccion n="5" titulo="Ciclos reproductivos">
                <PdfTabla
                    headers={["ID", "Tipo", "Estado", "Montas", "Inseminaciones"]}
                    empty="Sin ciclos registrados."
                    rows={ciclos.map((c) => [
                        `#${c.Id_Ciclo}`,
                        c.TipoCiclo || "—",
                        cicloEstado(c),
                        String(c.montas?.length || 0),
                        String(c.inseminaciones?.length || 0),
                    ])}
                />
            </PdfSeccion>

            {/* Montas e inseminaciones */}
            <PdfSeccion n="6" titulo="Montas e inseminaciones">
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#9f1239" }}>Montas</p>
                <PdfTabla
                    headers={["ID", "Fecha / hora", "Ciclo"]}
                    empty="Sin montas."
                    rows={montasTodas.map((m) => [
                        `#${m.Id_Monta}`,
                        fmtFechaHora(m.Fec_hora),
                        `#${m.Id_Ciclo}${m.TipoCiclo ? ` (${m.TipoCiclo})` : ""}`,
                    ])}
                />
                <p style={{ margin: "12px 0 6px", fontSize: 11, fontWeight: 700, color: "#0f766e" }}>Inseminaciones</p>
                <PdfTabla
                    headers={["ID", "Fecha / hora", "Ciclo"]}
                    empty="Sin inseminaciones."
                    rows={inseminacionesTodas.map((ins) => [
                        `#${ins.Id_Inseminacion}`,
                        fmtFechaHora(ins.Fec_hora),
                        `#${ins.Id_Ciclo}${ins.TipoCiclo ? ` (${ins.TipoCiclo})` : ""}`,
                    ])}
                />
            </PdfSeccion>

            {/* Partos */}
            <PdfSeccion n="7" titulo="Historial de partos">
                <PdfTabla
                    headers={["Fecha", "Ciclo", "Vivos", "Muertos", "Momias", "Peso (kg)", "Observaciones"]}
                    empty="Sin partos registrados."
                    rows={[...partos]
                        .sort((a, b) => String(a.Fec_inicio || "").localeCompare(String(b.Fec_inicio || "")))
                        .map((p) => [
                            fmtFecha(p.Fec_inicio),
                            p.Id_Ciclo ? `#${p.Id_Ciclo}` : "—",
                            String(p.Nac_vivos ?? "—"),
                            String(p.Nac_muertos ?? "—"),
                            String(p.Nac_momias ?? "—"),
                            String(p.Pes_camada ?? "—"),
                            p.Observaciones || "—",
                        ])}
                />
            </PdfSeccion>

            {/* Seguimientos */}
            <PdfSeccion n="8" titulo="Seguimiento de cerda">
                <PdfTabla
                    headers={["Fecha", "Hora", "Ciclo", "Responsable", "Medicamento", "Observaciones"]}
                    empty="Sin seguimientos."
                    rows={[...seguimientos]
                        .sort((a, b) => toSortKey(a.Fecha).localeCompare(toSortKey(b.Fecha)))
                        .map((s) => [
                            fmtFecha(s.Fecha),
                            s.Hora ? String(s.Hora).slice(0, 5) : "—",
                            s.Id_Ciclo ? `#${s.Id_Ciclo}` : "—",
                            s.Responsables?.Nombres || "—",
                            s.medicamentos?.Nombre || "—",
                            s.Observaciones || "—",
                        ])}
                />
            </PdfSeccion>

            {/* Novedades */}
            <PdfSeccion n="9" titulo="Novedades">
                <PdfTabla
                    headers={["Fecha", "Tipo", "Causa / motivo", "Observaciones"]}
                    empty="Sin novedades."
                    rows={[...novedades]
                        .sort((a, b) => toSortKey(a.Fecha_Novedad).localeCompare(toSortKey(b.Fecha_Novedad)))
                        .map((n) => [
                            fmtFecha(n.Fecha_Novedad),
                            n.Tipo_Novedad || "—",
                            n.Causa_Motivo || "—",
                            n.Observaciones || "—",
                        ])}
                />
            </PdfSeccion>

            <footer style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #d1d5db", fontSize: 9, color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                <span>Documento generado automáticamente por ReproPig</span>
                <span>{porcino.Nom_Porcino} · Chapeta {porcino.Num_Chapeta}</span>
            </footer>
        </div>
    )
}

export default function PerfilCerda() {
    const { id } = useParams()
    const navigate = useNavigate()
    const pdfRef = useRef(null)

    const [porcino, setPorcino] = useState(null)
    const [ciclos, setCiclos] = useState([])
    const [partos, setPartos] = useState([])
    const [novedades, setNovedades] = useState([])
    const [responsables, setResponsables] = useState([])
    const [loading, setLoading] = useState(true)
    const [cicloSeleccionado, setCicloSeleccionado] = useState(null)
    const [tabModal, setTabModal] = useState('todas') // 'todas', 'montas', 'inseminaciones'
    const [seguimientos, setSeguimientos] = useState([])
    const [exportando, setExportando] = useState(false)

    useEffect(() => {
        cargarDatos()
    }, [id])

    const cargarDatos = async () => {
        try {
            setLoading(true)

            const [resPorcino, resRepro, resPartos, resNovedades, resSeg] = await Promise.all([
                apiAxios.get(`/porcino/${id}`),
                apiAxios.get("/ciclos/"),
                apiAxios.get("/Partos/"),
                apiAxios.get("/novedades/"),
                apiAxios.get("/Seguimiento_Cerda/").catch(() => ({ data: [] })),
            ])

            // Traer responsables
            try {
                const resResp = await apiAxios.get('/responsables/')
                setResponsables(resResp.data)
            } catch (errResp) {
                console.error("Error al cargar responsables:", errResp)
            }
            setPorcino(resPorcino.data)
            setCiclos((resRepro.data || []).filter((r) => Number(r.Id_Cerda) === Number(id)))
            setPartos((resPartos.data || []).filter((p) => Number(p.Id_Porcino) === Number(id)))
            setNovedades((resNovedades.data || []).filter((n) => Number(n.Id_Porcino) === Number(id)))
            setSeguimientos((resSeg.data || []).filter((s) => Number(s.Id_Porcino) === Number(id)))
        } catch (error) {
            console.error("Error al cargar perfil:", error)
        } finally {
            setLoading(false)
        }
    }

    const getNombresResponsables = (Id_Responsable) => {
        if (!Id_Responsable || !responsables || responsables.length === 0) return '—'
        try {
            let ids = []
            if (typeof Id_Responsable === 'string' && Id_Responsable.startsWith('[')) {
                ids = JSON.parse(Id_Responsable).map(Number)
            } else if (Array.isArray(Id_Responsable)) {
                ids = Id_Responsable.map(Number)
            } else {
                ids = [Number(Id_Responsable)]
            }
            return ids.map(id => {
                const r = responsables.find(r => r.Id_Responsable === id)
                return r ? `${r.Nombres} ${r.Apellidos}` : `#${id}`
            }).join(', ')
        } catch { return String(Id_Responsable) }
    }

    const montasTodas = useMemo(
        () =>
            ciclos
                .flatMap((c) =>
                    (c.montas || []).map((m) => ({
                        ...m,
                        Id_Ciclo: c.Id_Ciclo,
                        TipoCiclo: c.TipoCiclo
                    }))
                )
                .sort((a, b) =>
                    toSortKey(a.Fec_hora).localeCompare(toSortKey(b.Fec_hora))
                ),
        [ciclos]
    )

    if (loading) return (
        <div className="flex justify-center items-center h-screen w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
        </div>
    )

    const inseminacionesTodas = useMemo(
        () =>
            ciclos
                .flatMap((c) =>
                    (c.inseminaciones || []).map((m) => ({ ...m, Id_Ciclo: c.Id_Ciclo, TipoCiclo: c.TipoCiclo }))
                )
                .sort((a, b) => toSortKey(a.Fec_hora).localeCompare(toSortKey(b.Fec_hora))),
        [ciclos]
    )

    const historialCronologico = useMemo(() => {
        const events = []

        montasTodas.forEach((m) => {
            events.push({
                sort: toSortKey(m.Fec_hora),
                fecha: fmtFechaHora(m.Fec_hora),
                tipo: "Monta",
                detalle: `Monta natural registrada`,
                ref: `Ciclo #${m.Id_Ciclo}${m.TipoCiclo ? ` · ${m.TipoCiclo}` : ""}`,
            })
        })

        inseminacionesTodas.forEach((ins) => {
            events.push({
                sort: toSortKey(ins.Fec_hora),
                fecha: fmtFechaHora(ins.Fec_hora),
                tipo: "Inseminación",
                detalle: `Inseminación artificial`,
                ref: `Ciclo #${ins.Id_Ciclo}${ins.TipoCiclo ? ` · ${ins.TipoCiclo}` : ""}`,
            })
        })

        partos.forEach((p) => {
            events.push({
                sort: toSortKey(p.Fec_inicio),
                fecha: fmtFecha(p.Fec_inicio),
                tipo: "Parto",
                detalle: `Vivos ${p.Nac_vivos ?? 0} · Muertos ${p.Nac_muertos ?? 0} · Momias ${p.Nac_momias ?? 0} · Peso ${p.Pes_camada ?? "—"} kg`,
                ref: p.Id_Ciclo ? `Ciclo #${p.Id_Ciclo}` : "—",
            })
        })

        seguimientos.forEach((s) => {
            events.push({
                sort: toSortKey(s.Fecha) + (s.Hora ? ` ${String(s.Hora).slice(0, 5)}` : ""),
                fecha: `${fmtFecha(s.Fecha)}${s.Hora ? ` ${String(s.Hora).slice(0, 5)}` : ""}`,
                tipo: "Seguimiento",
                detalle: [s.Observaciones, s.medicamentos?.Nombre ? `Med: ${s.medicamentos.Nombre}` : null, s.Responsables?.Nombres ? `Resp: ${s.Responsables.Nombres}` : null]
                    .filter(Boolean)
                    .join(" · ") || "Seguimiento clínico",
                ref: s.Id_Ciclo ? `Ciclo #${s.Id_Ciclo}` : "—",
            })
        })

        novedades.forEach((n) => {
            events.push({
                sort: toSortKey(n.Fecha_Novedad),
                fecha: fmtFecha(n.Fecha_Novedad),
                tipo: n.Tipo_Novedad || "Novedad",
                detalle: [n.Causa_Motivo, n.Observaciones].filter(Boolean).join(" · ") || "Sin detalle",
                ref: `#${n.Id_Novedad}`,
            })
        })

        return events.sort((a, b) => a.sort.localeCompare(b.sort))
    }, [montasTodas, inseminacionesTodas, partos, seguimientos, novedades])

    const exportarPDF = async () => {
        if (!pdfRef.current || exportando) return
        setExportando(true)
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import("jspdf"),
                import("html2canvas"),
            ]);

            const el = pdfRef.current
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: el.scrollWidth,
                windowWidth: el.scrollWidth,
            })

            const pdf = new jsPDF("p", "mm", "a4")
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            const margin = 6
            const usableH = pageH - margin * 2
            const imgW = pageW - margin * 2
            const imgH = (canvas.height * imgW) / canvas.width
            const imgData = canvas.toDataURL("image/jpeg", 0.95)

            let heightLeft = imgH
            let position = margin

            pdf.addImage(imgData, "JPEG", margin, position, imgW, imgH)
            heightLeft -= usableH

            while (heightLeft > 0) {
                position = margin - (imgH - heightLeft)
                pdf.addPage()
                pdf.addImage(imgData, "JPEG", margin, position, imgW, imgH)
                heightLeft -= usableH
            }

            const nombre = (porcino?.Nom_Porcino || "cerda").replace(/\s+/g, "_")
            pdf.save(`Hoja_de_Vida_${nombre}_${porcino?.Num_Chapeta || id}.pdf`)
        } catch (err) {
            console.error("Error exportando PDF:", err)
            window.print()
        } finally {
            setExportando(false)
        }
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
            </div>
        )
    if (!porcino)
        return <div className="p-10 text-center mt-5 text-gray-500 text-xl font-medium">Cerda no encontrada</div>

    const cicloActivo = (repro) => repro.Estado === "Activo" || repro.Activo === "S"

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-pink-600 transition-colors font-medium"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Volver a Porcinos
                </button>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-400 font-medium hidden sm:block">Perfil Clínico y Reproductivo</div>
                    <button
                        onClick={exportarPDF}
                        disabled={exportando}
                        className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
                    >
                        <i className="fa-solid fa-file-pdf"></i>
                        {exportando ? "Generando…" : "Exportar hoja de vida PDF"}
                    </button>
                </div>
            </div>

            {/* Plantilla oculta solo para PDF (informe organizado) */}
            <div
                aria-hidden="true"
                style={{ position: "fixed", left: -10000, top: 0, zIndex: -1, pointerEvents: "none" }}
            >
                <div ref={pdfRef}>
                    <DocumentoPDFHojaVida
                        porcino={porcino}
                        ciclos={ciclos}
                        partos={partos}
                        novedades={novedades}
                        seguimientos={seguimientos}
                        montasTodas={montasTodas}
                        inseminacionesTodas={inseminacionesTodas}
                        historialCronologico={historialCronologico}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-800">Hoja de Vida — {porcino.Nom_Porcino}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Chapeta {porcino.Num_Chapeta} · Generado {fmtFecha(new Date().toISOString())}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-br from-pink-100 to-pink-50 pt-8 pb-6 px-6 text-center relative">
                                <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-700 shadow-sm">
                                    ID: {porcino.Id_Porcino}
                                </div>
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-md mb-4 text-4xl border-4 border-pink-50">
                                    🐷
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">{porcino.Nom_Porcino}</h2>
                                <p className="text-gray-500 font-medium mb-3">
                                    Chapeta: <span className="text-gray-800 font-bold">{porcino.Num_Chapeta}</span>
                                </p>
                                <span className="inline-block bg-pink-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
                                    {porcino.razas?.Nom_Raza || "Sin raza definida"}
                                </span>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Información General</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center">
                                            <i className="fa-solid fa-id-card w-5 text-gray-400"></i> Placa SENA
                                        </span>
                                        <span className="font-semibold text-gray-800">{porcino.Plac_Sena_Porcino}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center">
                                            <i className="fa-solid fa-cake-candles w-5 text-gray-400"></i> Nacimiento
                                        </span>
                                        <span className="font-semibold text-gray-800">{fmtFecha(porcino.Fec_Nac_Porcino)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center">
                                            <i className="fa-solid fa-truck-ramp-box w-5 text-gray-400"></i> Llegada
                                        </span>
                                        <span className="font-semibold text-gray-800">{fmtFecha(porcino.Fec_Llegada)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 flex items-center">
                                            <i className="fa-solid fa-weight-scale w-5 text-gray-400"></i> Peso Inicial
                                        </span>
                                        <span className="font-semibold text-gray-800">{porcino.Peso_Llegada} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-500 flex items-center">
                                            <i className="fa-solid fa-location-dot w-5 text-gray-400"></i> Origen
                                        </span>
                                        <div className="text-right">
                                            <span className="font-semibold text-gray-800 block">{porcino.Proc_Porcino}</span>
                                            <span className="text-xs text-gray-400">{porcino.Lug_Proc_Porcino}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Resumen</h3>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <div className="text-2xl font-black text-blue-700">{ciclos.length}</div>
                                    <div className="text-xs font-semibold text-blue-600">Ciclos</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3">
                                    <div className="text-2xl font-black text-green-700">{partos.length}</div>
                                    <div className="text-xs font-semibold text-green-600">Partos</div>
                                </div>
                                <div className="bg-rose-50 rounded-xl p-3">
                                    <div className="text-2xl font-black text-rose-700">{montasTodas.length}</div>
                                    <div className="text-xs font-semibold text-rose-600">Montas</div>
                                </div>
                                <div className="bg-teal-50 rounded-xl p-3">
                                    <div className="text-2xl font-black text-teal-700">{inseminacionesTodas.length}</div>
                                    <div className="text-xs font-semibold text-teal-600">Inseminaciones</div>
                                </div>
                                <div className="bg-violet-50 rounded-xl p-3">
                                    <div className="text-2xl font-black text-violet-700">{seguimientos.length}</div>
                                    <div className="text-xs font-semibold text-violet-600">Seguimientos</div>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-3">
                                    <div className="text-2xl font-black text-orange-700">{novedades.length}</div>
                                    <div className="text-xs font-semibold text-orange-600">Novedades</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-chart-column"></i>
                                    </div>
                                    Historial gráfico de partos
                                </h3>
                            </div>
                            <GraficoHistorialPartos partos={partos} />
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-rotate"></i>
                                    </div>
                                    Ciclos Reproductivos
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {ciclos.length} Total
                                </span>
                            </div>

                            {ciclos.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No hay ciclos registradas para esta cerda.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                    {ciclos.map((repro) => {
                                        const esActivo = (repro.Estado || repro.Activo || '').toUpperCase() === 'ACTIVO' || repro.Activo === 'S';
                                        const numMontas = repro.montas?.length || 0;
                                        const numInsem = repro.inseminaciones?.length || 0;

                                        return (
                                            <div
                                                key={repro.Id_Ciclo}
                                                onClick={() => { setCicloSeleccionado(repro); setTabModal('todas'); }}
                                                className="border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-pink-300 transition-all bg-white relative overflow-hidden group cursor-pointer"
                                            >
                                                {/* Indicador de estado */}
                                                <div className={`absolute top-0 left-0 w-1.5 h-full ${esActivo ? 'bg-green-500' : 'bg-gray-300'}`}></div>

                                                <div className="flex justify-between items-start mb-4 pl-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ciclo #{repro.Id_Ciclo}</span>
                                                        <h4 className="text-lg font-bold text-gray-800 mt-0.5">{repro.TipoCiclo || 'Servicio'}</h4>
                                                    </div>
                                                    {esActivo ?
                                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Activo
                                                        </span>
                                                        :
                                                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">Cerrado</span>
                                                    }
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 pl-2">
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); setCicloSeleccionado(repro); setTabModal('montas'); }}
                                                        className="text-center hover:bg-amber-100/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                                        title="Ver detalle de montas"
                                                    >
                                                        <p className="text-xs text-amber-700 font-bold uppercase mb-1">🐷 Montas</p>
                                                        <p className="text-xl font-black text-amber-900">{numMontas}</p>
                                                    </div>
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); setCicloSeleccionado(repro); setTabModal('inseminaciones'); }}
                                                        className="text-center border-l border-gray-200 hover:bg-blue-100/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                                        title="Ver detalle de inseminaciones"
                                                    >
                                                        <p className="text-xs text-blue-700 font-bold uppercase mb-1">💉 Insem.</p>
                                                        <p className="text-xl font-black text-blue-900">{numInsem}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 text-center pl-2">
                                                    <span className="inline-flex items-center text-xs font-bold text-pink-600 group-hover:text-pink-700 group-hover:underline">
                                                        <i className="fa-solid fa-eye mr-1.5"></i> Ver toda la información del ciclo
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-heart"></i>
                                    </div>
                                    Todas las montas
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {montasTodas.length} Total
                                </span>
                            </div>
                            {montasTodas.length === 0 ? (
                                <p className="text-center text-gray-500 py-6">Sin montas registradas.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs uppercase text-gray-400 border-b">
                                                <th className="py-2 pr-2">ID</th>
                                                <th className="py-2 pr-2">Fecha</th>
                                                <th className="py-2">Ciclo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {montasTodas.map((m) => (
                                                <tr key={m.Id_Monta} className="border-b border-gray-50">
                                                    <td className="py-2 pr-2 font-semibold">#{m.Id_Monta}</td>
                                                    <td className="py-2 pr-2">{fmtFechaHora(m.Fec_hora)}</td>
                                                    <td className="py-2">
                                                        #{m.Id_Ciclo} {m.TipoCiclo ? `(${m.TipoCiclo})` : ""}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-syringe"></i>
                                    </div>
                                    Todas las inseminaciones
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {inseminacionesTodas.length} Total
                                </span>
                            </div>
                            {inseminacionesTodas.length === 0 ? (
                                <p className="text-center text-gray-500 py-6">Sin inseminaciones registradas.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs uppercase text-gray-400 border-b">
                                                <th className="py-2 pr-2">ID</th>
                                                <th className="py-2 pr-2">Fecha</th>
                                                <th className="py-2">Ciclo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inseminacionesTodas.map((ins) => (
                                                <tr key={ins.Id_Inseminacion} className="border-b border-gray-50">
                                                    <td className="py-2 pr-2 font-semibold">#{ins.Id_Inseminacion}</td>
                                                    <td className="py-2 pr-2">{fmtFechaHora(ins.Fec_hora)}</td>
                                                    <td className="py-2">
                                                        #{ins.Id_Ciclo} {ins.TipoCiclo ? `(${ins.TipoCiclo})` : ""}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-baby-carriage"></i>
                                    </div>
                                    Historial de Partos
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {partos.length} Total
                                </span>
                            </div>

                            {partos.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No hay partos registrados para esta cerda.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {partos.map((parto) => (
                                        <div
                                            key={parto.Id_parto}
                                            className="flex flex-col sm:flex-row items-center bg-white border border-gray-100 shadow-sm rounded-2xl p-4"
                                        >
                                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 text-center sm:text-left min-w-[120px]">
                                                <div className="text-sm font-bold text-gray-800">{fmtFecha(parto.Fec_inicio)}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Ciclo Ref:{" "}
                                                    <span className="font-semibold text-gray-600">#{parto.Id_Ciclo || "—"}</span>
                                                </div>
                                            </div>

                                            <div className="flex-grow w-full">
                                                <div className="grid grid-cols-4 gap-2">
                                                    <div className="bg-green-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-green-600 font-bold mb-1">Vivos</div>
                                                        <div className="text-lg font-black text-green-700">{parto.Nac_vivos}</div>
                                                    </div>
                                                    <div className="bg-red-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-red-600 font-bold mb-1">Muertos</div>
                                                        <div className="text-lg font-black text-red-700">{parto.Nac_muertos}</div>
                                                    </div>
                                                    <div className="bg-yellow-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-yellow-700 font-bold mb-1">Momias</div>
                                                        <div className="text-lg font-black text-yellow-700">{parto.Nac_momias}</div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                                                        <div className="text-xs text-gray-500 font-bold mb-1">Peso (kg)</div>
                                                        <div className="text-lg font-black text-gray-700">{parto.Pes_camada}</div>
                                                    </div>
                                                </div>
                                                {parto.Observaciones && (
                                                    <p className="text-xs text-gray-500 mt-2 italic">{parto.Observaciones}</p>
                                                )}
                                            </div>

                                            <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 flex justify-center">
                                                <button
                                                    onClick={() => navigate(`/actividades_camada/parto/${parto.Id_parto}`)}
                                                    className="text-pink-500 hover:bg-pink-50 p-2 rounded-xl transition-colors"
                                                    title="Ver Seguimiento de Camada"
                                                >
                                                    <i className="fa-solid fa-list-check"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-stethoscope"></i>
                                    </div>
                                    Seguimiento de cerda
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {seguimientos.length} Total
                                </span>
                            </div>
                            {seguimientos.length === 0 ? (
                                <p className="text-center text-gray-500 py-6">Sin seguimientos registrados.</p>
                            ) : (
                                <div className="space-y-3">
                                    {[...seguimientos]
                                        .sort((a, b) => String(b.Fecha || "").localeCompare(String(a.Fecha || "")))
                                        .map((seg) => (
                                            <div
                                                key={seg.Id_Seguimiento_Cerda}
                                                className="border border-gray-100 rounded-2xl p-4 bg-violet-50/40"
                                            >
                                                <div className="flex justify-between items-start gap-3 mb-1">
                                                    <span className="font-bold text-violet-800">
                                                        #{seg.Id_Seguimiento_Cerda} · {fmtFecha(seg.Fecha)}
                                                        {seg.Hora ? ` ${String(seg.Hora).slice(0, 5)}` : ""}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Ciclo #{seg.Id_Ciclo || "—"}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">
                                                    Resp: {seg.Responsables?.Nombres || "—"} · Med:{" "}
                                                    {seg.medicamentos?.Nombre || "—"}
                                                </p>
                                                {seg.Observaciones && (
                                                    <p className="text-sm text-gray-600 mt-1 italic">{seg.Observaciones}</p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    Registro de Novedades
                                </h3>
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                                    {novedades.length} Total
                                </span>
                            </div>

                            {novedades.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No hay novedades registradas para este porcino.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {novedades.map((nov) => {
                                        let bgClass = "bg-gray-50"
                                        let textClass = "text-gray-700"
                                        let icon = "fa-circle-info"

                                        if (nov.Tipo_Novedad === "Muerte" || nov.Tipo_Novedad === "Descarte") {
                                            bgClass = "bg-red-50"
                                            textClass = "text-red-700"
                                            icon = "fa-skull"
                                        } else if (nov.Tipo_Novedad === "Enfermedad" || nov.Tipo_Novedad === "Lesión") {
                                            bgClass = "bg-yellow-50"
                                            textClass = "text-yellow-700"
                                            icon = "fa-briefcase-medical"
                                        } else if (nov.Tipo_Novedad === "Traslado") {
                                            bgClass = "bg-blue-50"
                                            textClass = "text-blue-700"
                                            icon = "fa-truck-fast"
                                        }

                                        return (
                                            <div
                                                key={nov.Id_Novedad}
                                                className={`flex items-start ${bgClass} border border-gray-100 shadow-sm rounded-2xl p-4`}
                                            >
                                                <div
                                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${textClass} bg-white mr-4 shadow-sm`}
                                                >
                                                    <i className={`fa-solid ${icon}`}></i>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`font-bold ${textClass}`}>{nov.Tipo_Novedad}</h4>
                                                        <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                                                            {fmtFecha(nov.Fecha_Novedad)}
                                                        </span>
                                                    </div>
                                                    {nov.Causa_Motivo && (
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                                            Causa: {nov.Causa_Motivo}
                                                        </p>
                                                    )}
                                                    {nov.Observaciones && (
                                                        <p className="text-sm text-gray-600 italic">"{nov.Observaciones}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DETALLE DE CICLO REPRODUCTIVO */}
            {cicloSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        Ciclo #{cicloSeleccionado.Id_Ciclo}
                                    </span>
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${(cicloSeleccionado.Estado || cicloSeleccionado.Activo || '').toUpperCase() === 'ACTIVO' || cicloSeleccionado.Activo === 'S'
                                        ? 'bg-green-500/30 text-green-300 border border-green-500/40'
                                        : 'bg-gray-500/30 text-gray-300 border border-gray-500/40'
                                        }`}>
                                        {(cicloSeleccionado.Estado || cicloSeleccionado.Activo || '').toUpperCase() === 'ACTIVO' || cicloSeleccionado.Activo === 'S' ? 'Activo' : 'Cerrado'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight">
                                    {cicloSeleccionado.TipoCiclo || 'Ciclo Reproductivo'}
                                </h3>
                                <p className="text-xs text-gray-300 mt-1">
                                    Cerda: <strong className="text-white">{porcino.Nom_Porcino}</strong> (Chapeta: {porcino.Num_Chapeta})
                                </p>
                            </div>
                            <button
                                onClick={() => setCicloSeleccionado(null)}
                                className="text-gray-400 hover:text-white hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        {/* Selector de pestañas */}
                        <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-3 gap-2">
                            <button
                                onClick={() => setTabModal('todas')}
                                className={`pb-3 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 ${tabModal === 'todas'
                                    ? 'border-pink-600 text-pink-600 bg-white shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                    }`}>
                                Todos los registros ({(cicloSeleccionado.montas?.length || 0) + (cicloSeleccionado.inseminaciones?.length || 0)})
                            </button>
                            <button
                                onClick={() => setTabModal('montas')}
                                className={`pb-3 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 ${tabModal === 'montas'
                                    ? 'border-amber-600 text-amber-600 bg-white shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                    }`}>
                                🐷 Montas Naturales ({cicloSeleccionado.montas?.length || 0})
                            </button>
                            <button
                                onClick={() => setTabModal('inseminaciones')}
                                className={`pb-3 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 ${tabModal === 'inseminaciones'
                                    ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                    }`}>
                                💉 Inseminaciones ({cicloSeleccionado.inseminaciones?.length || 0})
                            </button>
                        </div>

                        {/* Modal Body / Scroll area */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                            {/* SECCIÓN MONTAS */}
                            {(tabModal === 'todas' || tabModal === 'montas') && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-amber-800 flex items-center uppercase tracking-wide">
                                            <i className="fa-solid fa-piggy-bank mr-2 text-amber-600"></i>
                                            Montas Naturales ({cicloSeleccionado.montas?.length || 0})
                                        </h4>
                                    </div>

                                    {(!cicloSeleccionado.montas || cicloSeleccionado.montas.length === 0) ? (
                                        <div className="text-center py-6 bg-amber-50/40 rounded-2xl border border-dashed border-amber-200/60">
                                            <p className="text-xs text-amber-700/70 font-medium">No se registraron montas naturales en este ciclo.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {cicloSeleccionado.montas.map((monta) => (
                                                <div key={`m-${monta.Id_Monta}`} className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-200/50">
                                                        <span className="font-bold text-amber-950 text-sm flex items-center">
                                                            Monta #{monta.Id_Monta}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                                                                <i className="fa-regular fa-clock mr-1 text-amber-600"></i>
                                                                {monta.Fec_hora ? new Date(monta.Fec_hora).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'Fecha no especificada'}
                                                            </span>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${(monta.Estado || '').toLowerCase() === 'inactivo' || monta.Estado === 'I'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {monta.Estado || 'Activo'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                                        <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Cerdo / Verraco</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-sm">
                                                                <i className="fa-solid fa-mars text-blue-500 mr-1.5"></i>
                                                                {monta.cerdo?.Nom_Porcino || (monta.Id_Cerdo ? `Cerdo #${monta.Id_Cerdo}` : 'Sin datos')}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Responsable(s)</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-xs">
                                                                <i className="fa-solid fa-user-gear text-gray-400 mr-1.5"></i>
                                                                {getNombresResponsables(monta.Id_Responsable)}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Ciclo Vinculado</span>
                                                            <span className="font-bold text-gray-800 mt-1 block text-xs">Ciclo #{monta.Id_Ciclo}</span>
                                                        </div>
                                                    </div>

                                                    {monta.Observaciones && (
                                                        <div className="mt-3 pt-2 border-t border-amber-200/50 text-xs text-gray-700 bg-white/70 p-2.5 rounded-xl">
                                                            <strong className="text-amber-900">Observaciones:</strong> <span className="italic">"{monta.Observaciones}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SECCIÓN INSEMINACIONES */}
                            {(tabModal === 'todas' || tabModal === 'inseminaciones') && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-blue-800 flex items-center uppercase tracking-wide">
                                            <i className="fa-solid fa-syringe mr-2 text-blue-600"></i>
                                            Inseminaciones Artificiales ({cicloSeleccionado.inseminaciones?.length || 0})
                                        </h4>
                                    </div>

                                    {(!cicloSeleccionado.inseminaciones || cicloSeleccionado.inseminaciones.length === 0) ? (
                                        <div className="text-center py-6 bg-blue-50/40 rounded-2xl border border-dashed border-blue-200/60">
                                            <p className="text-xs text-blue-700/70 font-medium">No se registraron inseminaciones artificiales en este ciclo.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {cicloSeleccionado.inseminaciones.map((insem) => (
                                                <div key={`i-${insem.Id_Inseminacion}`} className="bg-blue-50/50 border border-blue-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-blue-200/50">
                                                        <span className="font-bold text-blue-950 text-sm flex items-center">
                                                            Inseminación #{insem.Id_Inseminacion}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                                                                <i className="fa-regular fa-clock mr-1 text-blue-600"></i>
                                                                {insem.Fec_hora ? new Date(insem.Fec_hora).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'Fecha no especificada'}
                                                            </span>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${(insem.Estado || '').toLowerCase() === 'inactivo' || insem.Estado === 'I'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {insem.Estado || 'Activo'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                                        <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Cantidad Dosis</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-sm">
                                                                <i className="fa-solid fa-vial text-blue-500 mr-1.5"></i>
                                                                {insem.cantidad || 1} pajilla(s)
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Colecta de Origen</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-xs">
                                                                <i className="fa-solid fa-flask text-teal-600 mr-1.5"></i>
                                                                {insem.Id_colecta ? (
                                                                    <span>
                                                                        Colecta #{insem.Id_colecta}
                                                                        {insem.colecta?.porcino?.Nom_Porcino && (
                                                                            <span className="text-gray-500 font-semibold ml-1">({insem.colecta.porcino.Nom_Porcino})</span>
                                                                        )}
                                                                    </span>
                                                                ) : 'Sin colecta vinculada'}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] block">Responsable(s)</span>
                                                            <span className="font-bold text-gray-800 flex items-center mt-1 text-xs">
                                                                <i className="fa-solid fa-user-gear text-gray-400 mr-1.5"></i>
                                                                {getNombresResponsables(insem.Id_Responsable)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {insem.Observaciones && (
                                                        <div className="mt-3 pt-2 border-t border-blue-200/50 text-xs text-gray-700 bg-white/70 p-2.5 rounded-xl">
                                                            <strong className="text-blue-900">Observaciones:</strong> <span className="italic">"{insem.Observaciones}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 border-t border-gray-100 p-4 px-6 flex justify-end">
                            <button
                                onClick={() => setCicloSeleccionado(null)}
                                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
