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
    const totales = useMemo(() => {
        let vivos = 0, muertos = 0, momias = 0;
        partos.forEach(p => {
            vivos += Number(p.Nac_vivos) || 0;
            muertos += Number(p.Nac_muertos) || 0;
            momias += Number(p.Nac_momias) || 0;
        });
        return { vivos, muertos, momias };
    }, [partos]);

    const total = totales.vivos + totales.muertos + totales.momias;

    if (total === 0) {
        return (
            <div className={forPdf ? "pdf-empty" : "text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200"}>
                <p className={forPdf ? undefined : "text-gray-500 font-medium"}>Sin datos para graficar.</p>
            </div>
        )
    }

    const series = [
        { key: "vivos", color: "#15803d", label: "Vivos", value: totales.vivos },
        { key: "muertos", color: "#b91c1c", label: "Muertos", value: totales.muertos },
        { key: "momias", color: "#a16207", label: "Momias", value: totales.momias },
    ].filter(s => s.value > 0);

    const w = forPdf ? 400 : 400;
    const h = forPdf ? 220 : 250;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 40;

    let startAngle = 0;

    return (
        <div className={forPdf ? undefined : "w-full flex flex-col items-center justify-center overflow-x-auto"} style={forPdf ? { textAlign: "center" } : {}}>
            <svg viewBox={`0 0 ${w} ${h}`} width={forPdf ? w : "100%"} height={forPdf ? h : undefined} style={forPdf ? { display: "inline-block", maxWidth: "100%" } : undefined} role="img" aria-label="Distribución de partos">
                {series.map((s, i) => {
                    const sliceAngle = (s.value / total) * 2 * Math.PI;
                    const endAngle = startAngle + sliceAngle;
                    
                    const x1 = cx + r * Math.cos(startAngle);
                    const y1 = cy + r * Math.sin(startAngle);
                    const x2 = cx + r * Math.cos(endAngle);
                    const y2 = cy + r * Math.sin(endAngle);
                    
                    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
                    let pathData = "";
                    
                    if (s.value === total) {
                        pathData = `M ${cx}, ${cy - r} A ${r},${r} 0 1,1 ${cx},${cy + r} A ${r},${r} 0 1,1 ${cx},${cy - r}`;
                    } else {
                        pathData = [
                            `M ${cx} ${cy}`,
                            `L ${x1} ${y1}`,
                            `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            `Z`
                        ].join(" ");
                    }

                    // Label position
                    const midAngle = startAngle + sliceAngle / 2;
                    // Push labels further out
                    const labelR = r + 35;
                    const labelX = cx + labelR * Math.cos(midAngle);
                    const labelY = cy + labelR * Math.sin(midAngle);
                    
                    const percentage = Math.round((s.value / total) * 100);
                    
                    // Determine text anchor based on x position to prevent overlap
                    const isRight = Math.cos(midAngle) >= 0;
                    const textAnchor = isRight ? "start" : "end";

                    startAngle = endAngle;

                    return (
                        <g key={s.key}>
                            <path d={pathData} fill={s.color} stroke="#ffffff" strokeWidth="2" />
                            {/* Connect line from pie to label */}
                            <line 
                                x1={cx + r * Math.cos(midAngle)} 
                                y1={cy + r * Math.sin(midAngle)} 
                                x2={cx + (labelR - 5) * Math.cos(midAngle)} 
                                y2={cy + (labelR - 5) * Math.sin(midAngle)} 
                                stroke="#9ca3af" 
                                strokeWidth="1" 
                            />
                            <text 
                                x={labelX} 
                                y={labelY} 
                                textAnchor={textAnchor} 
                                dominantBaseline="middle" 
                                fontSize="12" 
                                fontWeight="bold"
                                fill="#374151"
                            >
                                {s.label}: {percentage}% ({s.value})
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}

function PdfSeccion({ n, titulo, children }) {
    return (
        <section className="pdf-avoid-break" style={{ marginBottom: 18 }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#fdf8fa", padding: 16, borderRadius: 8, border: "1px solid #fbcfe8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f9a8d4", paddingBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: "#be185d", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Nombre</div>
                            <div style={{ fontWeight: 900, fontSize: 18, color: "#831843", marginTop: 2 }}>{porcino.Nom_Porcino}</div>
                        </div>
                        <div style={{ flex: 1, borderLeft: "1px solid #f9a8d4", paddingLeft: 16 }}>
                            <div style={{ fontSize: 10, color: "#be185d", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Chapeta</div>
                            <div style={{ fontWeight: 900, fontSize: 18, color: "#831843", marginTop: 2 }}>{porcino.Num_Chapeta}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
                        <div style={{ flex: "1 1 calc(33.333% - 16px)", display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Raza</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{porcino.raza?.Nom_Raza || "—"}</span>
                        </div>
                        <div style={{ flex: "1 1 calc(33.333% - 16px)", display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Placa SENA</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{porcino.Plac_Sena_Porcino || "—"}</span>
                        </div>
                        <div style={{ flex: "1 1 calc(33.333% - 16px)", display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Nacimiento</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{fmtFecha(porcino.Fec_Nac_Porcino)}</span>
                        </div>
                        <div style={{ flex: "1 1 calc(33.333% - 16px)", display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Llegada</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{fmtFecha(porcino.Fec_Llegada)}</span>
                        </div>
                        <div style={{ flex: "1 1 calc(33.333% - 16px)", display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Peso inicial</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{porcino.Peso_Llegada != null ? `${porcino.Peso_Llegada} kg` : "—"}</span>
                        </div>
                        <div style={{ flex: "1 1 calc(33.333% - 16px)", display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Origen</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{[porcino.Proc_Porcino, porcino.Lug_Proc_Porcino].filter(Boolean).join(" · ") || "—"}</span>
                        </div>
                    </div>
                </div>
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



            {/* Novedades */}
            <PdfSeccion n="5" titulo="Novedades">
                {novedades.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>Sin novedades.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[...novedades]
                            .sort((a, b) => toSortKey(a.Fecha_Novedad).localeCompare(toSortKey(b.Fecha_Novedad)))
                            .map((n) => {
                                const isMuerte = n.Tipo_Novedad === "Muerte" || n.Tipo_Novedad === "Descarte";
                                const isMomia = n.Causa_Motivo?.toLowerCase().includes("momia") || n.Observaciones?.toLowerCase().includes("momia");
                                const causaMotivoFinal = isMomia ? "Momia" : (n.Causa_Motivo || "—");
                                
                                return (
                                    <div 
                                        className="pdf-avoid-break"
                                        key={n.Id_Novedad} 
                                        style={{ 
                                            border: `1px solid ${isMuerte ? "#fca5a5" : "#e5e7eb"}`, 
                                            background: isMuerte ? "#fef2f2" : "#f9fafb",
                                            padding: 10, 
                                            borderRadius: 6
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${isMuerte ? "#fecaca" : "#e5e7eb"}`, paddingBottom: 6, marginBottom: 6 }}>
                                            <div style={{ fontWeight: 800, fontSize: 12, color: isMuerte ? "#b91c1c" : "#374151", textTransform: "uppercase" }}>
                                                {isMuerte && isMomia ? "Muerte de cría: Momia" : (n.Tipo_Novedad || "Novedad")}
                                            </div>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280" }}>
                                                {fmtFecha(n.Fecha_Novedad)}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 11, color: "#1f2937", lineHeight: 1.4 }}>
                                            <span style={{ fontWeight: 700, color: isMuerte ? "#991b1b" : "#4b5563" }}>Causa / Motivo:</span> {causaMotivoFinal}
                                        </div>
                                        {n.Observaciones && (
                                            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4, fontStyle: "italic" }}>
                                                <span style={{ fontWeight: 700, fontStyle: "normal" }}>Observaciones:</span> {n.Observaciones}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
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
    const [seguimientos, setSeguimientos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [loading, setLoading] = useState(true)
    const [exportando, setExportando] = useState(false)

    useEffect(() => {
        cargarDatos()
    }, [id])

    const cargarDatos = async () => {
        try {
            setLoading(true)

            const [resPorcino, resRepro, resPartos, resNovedades, resSeg, resResp] = await Promise.all([
                apiAxios.get(`/porcino/${id}`),
                apiAxios.get("/ciclos/"),
                apiAxios.get("/Partos/"),
                apiAxios.get("/novedades/"),
                apiAxios.get("/Seguimiento_Cerda/").catch(() => ({ data: [] })),
                apiAxios.get("/responsables/").catch(() => ({ data: [] })),
            ])

            setPorcino(resPorcino.data)
            setCiclos((resRepro.data || []).filter((r) => Number(r.Id_Cerda) === Number(id)))
            setPartos((resPartos.data || []).filter((p) => Number(p.Id_Porcino) === Number(id)))
            setNovedades((resNovedades.data || []).filter((n) => Number(n.Id_Porcino) === Number(id)))
            setSeguimientos((resSeg.data || []).filter((s) => Number(s.Id_Porcino) === Number(id)))
            setResponsables(resResp.data || [])
        } catch (error) {
            console.error("Error al cargar perfil:", error)
        } finally {
            setLoading(false)
        }
    }

    const getNombresResponsables = (Id_Responsable) => {
        if (!Id_Responsable || responsables.length === 0) return null
        try {
            let ids = []
            if (typeof Id_Responsable === 'string' && Id_Responsable.startsWith('[')) {
                ids = JSON.parse(Id_Responsable).map(Number)
            } else {
                ids = [Number(Id_Responsable)]
            }
            const res = ids.map(id => {
                const r = responsables.find(r => r.Id_Responsable === id)
                return r ? `${r.Nombres} ${r.Apellidos}` : null
            }).filter(Boolean)
            return res.length > 0 ? res.join(', ') : null
        } catch { return null }
    }

    const montasTodas = useMemo(
        () =>
            ciclos
                .flatMap((c) => (c.montas || []).map((m) => ({ ...m, Id_Ciclo: c.Id_Ciclo, TipoCiclo: c.TipoCiclo })))
                .sort((a, b) => toSortKey(a.Fec_hora).localeCompare(toSortKey(b.Fec_hora))),
        [ciclos]
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
            const resp = getNombresResponsables(m.Id_Responsable) || m.Responsables?.Nombres;
            events.push({
                sort: toSortKey(m.Fec_hora),
                fecha: fmtFechaHora(m.Fec_hora),
                tipo: "Monta",
                detalle: [`Monta natural registrada`, resp ? `Resp: ${resp}` : null].filter(Boolean).join(" · "),
                ref: `Ciclo #${m.Id_Ciclo}${m.TipoCiclo ? ` · ${m.TipoCiclo}` : ""}`,
            })
        })

        inseminacionesTodas.forEach((ins) => {
            const resp = getNombresResponsables(ins.Id_Responsable) || ins.Responsables?.Nombres;
            events.push({
                sort: toSortKey(ins.Fec_hora),
                fecha: fmtFechaHora(ins.Fec_hora),
                tipo: "Inseminación",
                detalle: [`Inseminación artificial`, resp ? `Resp: ${resp}` : null].filter(Boolean).join(" · "),
                ref: `Ciclo #${ins.Id_Ciclo}${ins.TipoCiclo ? ` · ${ins.TipoCiclo}` : ""}`,
            })
        })

        partos.forEach((p) => {
            const resp = getNombresResponsables(p.Id_Responsable) || p.Responsables?.Nombres;
            events.push({
                sort: toSortKey(p.Fec_inicio),
                fecha: fmtFecha(p.Fec_inicio),
                tipo: "Parto",
                detalle: [`Vivos ${p.Nac_vivos ?? 0} · Muertos ${p.Nac_muertos ?? 0} · Momias ${p.Nac_momias ?? 0} · Peso ${p.Pes_camada ?? "—"} kg`, resp ? `Resp: ${resp}` : null].filter(Boolean).join(" · "),
                ref: p.Id_Ciclo ? `Ciclo #${p.Id_Ciclo}` : "—",
            })
        })

        seguimientos.forEach((s) => {
            const resp = getNombresResponsables(s.Id_Responsable) || s.Responsables?.Nombres;
            events.push({
                sort: toSortKey(s.Fecha) + (s.Hora ? ` ${String(s.Hora).slice(0, 5)}` : ""),
                fecha: `${fmtFecha(s.Fecha)}${s.Hora ? ` ${String(s.Hora).slice(0, 5)}` : ""}`,
                tipo: "Seguimiento",
                detalle: [s.Observaciones, s.medicamentos?.Nombre ? `Med: ${s.medicamentos.Nombre}` : null, resp ? `Resp: ${resp}` : null]
                    .filter(Boolean)
                    .join(" · ") || "Seguimiento clínico",
                ref: s.Id_Ciclo ? `Ciclo #${s.Id_Ciclo}` : "—",
            })
        })

        return events.sort((a, b) => a.sort.localeCompare(b.sort))
    }, [montasTodas, inseminacionesTodas, partos, seguimientos, responsables])

    const exportarPDF = async () => {
        if (!pdfRef.current || exportando) return
        setExportando(true)
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import("jspdf"),
                import("html2canvas"),
            ])

            const el = pdfRef.current
            
            // Calculate page dimensions in pixels
            const pdf = new jsPDF("p", "mm", "a4")
            const margin = 6
            const pageW = pdf.internal.pageSize.getWidth() - margin * 2
            const pageH = pdf.internal.pageSize.getHeight() - margin * 2
            
            // Pixels per page
            const pxPageH = (el.scrollWidth * pageH) / pageW
            
            const avoidElements = el.querySelectorAll('.pdf-avoid-break')
            const spacers = []
            
            // Force layout recalculation inside loop
            avoidElements.forEach(node => {
                const elRect = el.getBoundingClientRect()
                const rect = node.getBoundingClientRect()
                const top = rect.top - elRect.top
                const height = rect.height
                
                const currentPage = Math.floor(top / pxPageH)
                const endPage = Math.floor((top + height) / pxPageH)
                
                // If it crosses a boundary and isn't bigger than a full page itself
                if (endPage > currentPage && height < pxPageH) {
                    const spaceNeeded = ((currentPage + 1) * pxPageH) - top
                    const spacer = document.createElement('div')
                    spacer.style.height = `${spaceNeeded}px`
                    spacer.className = "pdf-temp-spacer"
                    node.parentNode.insertBefore(spacer, node)
                    spacers.push(spacer)
                }
            })

            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: el.scrollWidth,
                windowWidth: el.scrollWidth,
            })
            
            spacers.forEach(s => s.remove())

            const imgW = pageW
            const imgH = (canvas.height * imgW) / canvas.width
            const usableH = pageH
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
            setExportando(false)
            return;
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
                                    {porcino.raza?.Nom_Raza || "Sin raza definida"}
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
                                <div className="space-y-4">
                                    {ciclos.map((repro) => (
                                        <div
                                            key={repro.Id_Ciclo}
                                            className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 relative overflow-hidden"
                                        >
                                            <div
                                                className={`absolute top-0 left-0 w-1 h-full ${cicloActivo(repro) ? "bg-green-500" : "bg-gray-300"}`}
                                            ></div>

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                        Ciclo #{repro.Id_Ciclo}
                                                    </span>
                                                    <h4 className="text-lg font-bold text-gray-800 mt-1">{repro.TipoCiclo}</h4>
                                                </div>
                                                {cicloActivo(repro) ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md">
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">
                                                        {repro.Estado || "Cerrado"}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-gray-100 mb-3">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Montas</p>
                                                    <p className="text-xl font-black text-gray-700">{repro.montas?.length || 0}</p>
                                                </div>
                                                <div className="text-center border-l border-gray-100">
                                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Insem.</p>
                                                    <p className="text-xl font-black text-gray-700">
                                                        {repro.inseminaciones?.length || 0}
                                                    </p>
                                                </div>
                                            </div>

                                            {(repro.montas?.length > 0 || repro.inseminaciones?.length > 0) && (
                                                <div className="space-y-2 text-sm">
                                                    {(repro.montas || []).map((m) => (
                                                        <div
                                                            key={`m-${m.Id_Monta}`}
                                                            className="flex justify-between bg-rose-50/80 rounded-lg px-3 py-2"
                                                        >
                                                            <span className="font-semibold text-rose-700">
                                                                Monta #{m.Id_Monta}
                                                            </span>
                                                            <span className="text-gray-600">{fmtFechaHora(m.Fec_hora)}</span>
                                                        </div>
                                                    ))}
                                                    {(repro.inseminaciones || []).map((ins) => (
                                                        <div
                                                            key={`i-${ins.Id_Inseminacion}`}
                                                            className="flex justify-between bg-teal-50/80 rounded-lg px-3 py-2"
                                                        >
                                                            <span className="font-semibold text-teal-700">
                                                                Inseminación #{ins.Id_Inseminacion}
                                                            </span>
                                                            <span className="text-gray-600">{fmtFechaHora(ins.Fec_hora)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
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

                                        const isMuerte = nov.Tipo_Novedad === "Muerte" || nov.Tipo_Novedad === "Descarte";
                                        const isMomia = nov.Causa_Motivo?.toLowerCase().includes("momia") || nov.Observaciones?.toLowerCase().includes("momia");
                                        const causaMotivoFinal = isMomia ? "Momia" : nov.Causa_Motivo;

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
                                                        <h4 className={`font-bold ${textClass}`}>{isMuerte && isMomia ? "Muerte de cría: Momia" : nov.Tipo_Novedad}</h4>
                                                        <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                                                            {fmtFecha(nov.Fecha_Novedad)}
                                                        </span>
                                                    </div>
                                                    {causaMotivoFinal && (
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                                            Causa: {causaMotivoFinal}
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
        </div>
    )
}
