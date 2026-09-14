import { jsPDF } from "./Repropig_React/repropig-front/node_modules/jspdf/dist/jspdf.es.min.js"
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, "Resumen_Cambios_ReproPig.pdf")
const diffPath = join(__dirname, "_all_diffs.txt")

const raw = readFileSync(diffPath, "utf8")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n")

/** Parse unified diffs into per-file blocks */
function parseDiffs(text) {
  const blocks = []
  const parts = text.split(/^diff --git /m).filter(Boolean)
  for (const part of parts) {
    const lines = ("diff --git " + part).split("\n")
    const header = lines[0] || ""
    const m = header.match(/b\/(.+)$/)
    const file = m ? m[1].trim() : header
    const body = lines.slice(1)
    blocks.push({ file, lines: body })
  }
  return blocks
}

const files = parseDiffs(raw)

const doc = new jsPDF({ unit: "mm", format: "a4" })
const pageW = doc.internal.pageSize.getWidth()
const pageH = doc.internal.pageSize.getHeight()
const margin = 12
const maxW = pageW - margin * 2
let y = margin

const ensureSpace = (need = 8) => {
  if (y + need > pageH - 12) {
    doc.addPage()
    y = margin
    drawFooter()
  }
}

const drawFooter = () => {
  const page = doc.internal.getNumberOfPages()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(120)
  doc.text("ReproPig · Cambios + código (diff) · feature/Alejandra", margin, pageH - 6)
  doc.text(`Pág. ${page}`, pageW - margin, pageH - 6, { align: "right" })
  doc.setTextColor(0)
}

const title = (text) => {
  ensureSpace(14)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(190, 24, 93)
  doc.text(text, margin, y)
  y += 7
  doc.setDrawColor(190, 24, 93)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 5
  doc.setTextColor(0)
}

const h2 = (text) => {
  ensureSpace(12)
  doc.setFillColor(31, 41, 55)
  doc.roundedRect(margin, y - 3.5, maxW, 8, 1, 1, "F")
  doc.setTextColor(255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(text, margin + 3, y + 1.5)
  y += 9
  doc.setTextColor(0)
}

const h3 = (text) => {
  ensureSpace(9)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(55, 65, 81)
  const lines = doc.splitTextToSize(text, maxW)
  for (const line of lines) {
    ensureSpace(5)
    doc.text(line, margin, y)
    y += 4.5
  }
  y += 1
  doc.setTextColor(0)
}

const para = (text) => {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(31, 41, 55)
  const lines = doc.splitTextToSize(text, maxW)
  for (const line of lines) {
    ensureSpace(5)
    doc.text(line, margin, y)
    y += 4.4
  }
  y += 1.2
}

const bullet = (text) => {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(31, 41, 55)
  const lines = doc.splitTextToSize(text, maxW - 5)
  for (let i = 0; i < lines.length; i++) {
    ensureSpace(5)
    if (i === 0) doc.text("•", margin + 1, y)
    doc.text(lines[i], margin + 5, y)
    y += 4.3
  }
  y += 0.5
}

/** Render a diff line with color background */
const renderDiffLine = (line) => {
  // Skip noisy binary/index noise lightly, keep +++ --- @@
  let bg = null
  let fg = [31, 41, 55]
  let prefix = " "

  if (line.startsWith("+++") || line.startsWith("---") || line.startsWith("diff ") || line.startsWith("index ")) {
    fg = [107, 114, 128]
  } else if (line.startsWith("@@")) {
    bg = [219, 234, 254]
    fg = [30, 64, 175]
  } else if (line.startsWith("+")) {
    bg = [220, 252, 231]
    fg = [22, 101, 52]
    prefix = "+"
  } else if (line.startsWith("-")) {
    bg = [254, 226, 226]
    fg = [153, 27, 27]
    prefix = "-"
  }

  doc.setFont("courier", "normal")
  doc.setFontSize(6.5)

  // wrap long lines
  const content = line.length > 0 ? line : " "
  const wrapped = doc.splitTextToSize(content, maxW - 2)
  for (const wline of wrapped) {
    ensureSpace(4.2)
    if (bg) {
      doc.setFillColor(...bg)
      doc.rect(margin, y - 2.8, maxW, 3.8, "F")
    }
    doc.setTextColor(...fg)
    doc.text(wline, margin + 1, y)
    y += 3.6
  }
  doc.setTextColor(0)
  doc.setFont("helvetica", "normal")
}

drawFooter()

// ===== PORTADA / RESUMEN =====
title("Cambios recientes ReproPig + código modificado")
para(`Rama: feature/Alejandra  |  Estado: sin commit  |  Generado: ${new Date().toLocaleString("es-CO")}`)
para("Este PDF incluye: (A) resumen por actividad y (B) el diff completo del código (líneas agregadas en verde, eliminadas en rojo).")

h2("A. Resumen por actividad")

h3("1. Hoja de vida / PerfilCerda (PDF)")
bullet("Más registros: ciclos, montas, inseminaciones, partos, seguimientos, novedades.")
bullet("Gráfico de historial de partos.")
bullet("Exportar PDF con plantilla de informe (secciones + tablas + historial cronológico).")
bullet("Deps nuevas: jspdf, html2canvas.")

h3("2. Montas")
bullet("Campo estado Activo/Inactivo + endpoint toggle-estado + UI para activar/inactivar.")

h3("3. Inseminaciones")
bullet("Campo estado + toggle-estado + UI; limpieza del controller.")

h3("4. Partos")
bullet("Id_Responsable (TEXT, múltiples) en modelo, formulario y listado/filtro.")

h3("5. Actividades de camada / Todas las actividades")
bullet("Id_Medicamento → TEXT; Id_Responsable nuevo; SubActividades y CrudActividades ampliados.")

h3("6. Backend app.js")
bullet("ALTER TABLE automáticos al arrancar para columnas nuevas/estado.")

para(`Archivos en el diff: ${files.length}`)
files.forEach((f, i) => bullet(`${i + 1}. ${f.file}`))

// ===== CÓDIGO / DIFF =====
doc.addPage()
y = margin
drawFooter()
title("B. Código modificado (git diff)")
para("Leyenda: verde = línea agregada (+)  ·  rojo = línea eliminada (−)  ·  azul = hunk (@@).")

for (const block of files) {
  h2(block.file)
  para(`${block.lines.length} líneas en el diff de este archivo`)

  // Skip empty trailing
  const useful = block.lines.filter((l, idx) => !(idx === block.lines.length - 1 && l === ""))
  for (const line of useful) {
    // Avoid dumping huge lockfile body if any slipped in — package-lock was excluded from export
    renderDiffLine(line)
  }
  y += 3
}

// Nota final
ensureSpace(20)
doc.setFillColor(253, 242, 248)
doc.roundedRect(margin, y - 3, maxW, 16, 2, 2, "F")
doc.setFont("helvetica", "bold")
doc.setFontSize(9)
doc.setTextColor(157, 23, 77)
doc.text("Nota", margin + 3, y + 2)
doc.setFont("helvetica", "normal")
doc.setTextColor(55, 65, 81)
doc.text("Diff tomado del working tree (git diff) al momento de generar este PDF.", margin + 3, y + 8)

const buf = Buffer.from(doc.output("arraybuffer"))
writeFileSync(outPath, buf)
console.log("PDF_OK:" + outPath)
console.log("PAGES:" + doc.internal.getNumberOfPages())
console.log("FILES:" + files.length)
