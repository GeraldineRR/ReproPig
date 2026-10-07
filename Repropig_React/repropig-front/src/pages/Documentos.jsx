import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../layout/Footer"
import logo from "../assets/logo.png"

function Documentos() {
  const navigate = useNavigate()
  const [modalPdfOpen, setModalPdfOpen] = useState(false)
  const pdfUrl = "/docs/Manual_de_Usuario_ReproPig.pdf"

  const modulosGuia = [
    {
      icono: "fa-solid fa-piggy-bank",
      color: "text-pink-500",
      bgColor: "bg-pink-100",
      titulo: "Gestión de Porcinos y Razas",
      desc: "Registro completo de reproductores (hembras y machos), identificación por chapa, raza, genealogía y estado productivo actual."
    },
    {
      icono: "fa-solid fa-dna",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      titulo: "Montas e Inseminaciones",
      desc: "Control de cruces naturales y dosis seminales, con cálculo automático de repetición de celo (21 días) y fecha probable de parto."
    },
    {
      icono: "fa-solid fa-vial-virus",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      titulo: "Colectas Seminales",
      desc: "Evaluación de calidad seminal: volumen (ml), motilidad masal e individual, concentración y viabilidad para inseminación."
    },
    {
      icono: "fa-solid fa-baby",
      color: "text-rose-500",
      bgColor: "bg-rose-100",
      titulo: "Partos y Camadas",
      desc: "Registro de lechones vivos (machos/hembras), muertos, momias, peso promedio y seguimiento a tareas críticas (hierro, colmillos, destete)."
    },
    {
      icono: "fa-solid fa-kit-medical",
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
      titulo: "Sanidad y Medicamentos",
      desc: "Control de inventario farmacológico, aplicación de vacunas, tratamientos preventivos y verificación de periodos de retiro en carne."
    },
    {
      icono: "fa-solid fa-calendar-check",
      color: "text-amber-500",
      bgColor: "bg-amber-100",
      titulo: "Calendario y Alertas",
      desc: "Notificaciones oportunas para partos inminentes, revisiones de celo, destetes programados y novedades reproductivas del día."
    }
  ]

  const handleVerPdf = () => {
    setModalPdfOpen(true)
  }

  const handleDescargarPdf = () => {
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = "Manual_de_Usuario_ReproPig.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

        .docs-page {
          min-height: 100vh;
          background: linear-gradient(120deg, #F7A8B8 0%, #FBBFD0 25%, #FDD5C0 60%, #FDE8D8 100%);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }

        .docs-container {
          flex: 1;
          max-width: 1080px;
          margin: 0 auto;
          padding: 50px 24px 80px;
          width: 100%;
        }

        .docs-badge-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .docs-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          color: #B05068;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(176, 80, 104, 0.08);
          animation: docs-fadeUp 0.5s ease both;
        }

        .docs-title {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900;
          color: #8a4f58;
          text-align: center;
          line-height: 1.15;
          margin-bottom: 16px;
          animation: docs-fadeUp 0.55s ease 0.1s both;
        }

        .docs-subtitle {
          font-size: 1.15rem;
          color: #5A333E;
          text-align: center;
          font-weight: 600;
          max-width: 780px;
          margin: 0 auto 40px;
          line-height: 1.6;
          animation: docs-fadeUp 0.55s ease 0.2s both;
        }

        .docs-header-card {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(138, 79, 88, 0.12);
          margin-bottom: 40px;
          animation: docs-fadeUp 0.6s ease 0.3s both;
          position: relative;
          overflow: hidden;
        }

        .docs-header-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #ec4899, #f43f5e, #fb7185);
        }

        .docs-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .docs-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: #ffe4e8;
          color: #ec4899;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.04);
          flex-shrink: 0;
        }

        .docs-card-title {
          font-family: 'Nunito', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #8a4f58;
          line-height: 1.2;
        }

        .docs-card-subtitle {
          font-size: 0.88rem;
          font-weight: 700;
          color: #ec4899;
          margin-top: 2px;
        }

        .docs-description {
          font-size: 1.15rem;
          color: #3d2532;
          line-height: 1.85;
          font-weight: 500;
          text-align: justify;
          margin-bottom: 30px;
        }

        .docs-meta-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 30px;
        }

        .docs-meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fdf2f8;
          color: #be185d;
          border: 1px solid #fbcfe8;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .docs-btn-group {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
        }

        .docs-btn-primary {
          background: #2563eb;
          color: white;
          padding: 14px 34px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .docs-btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.35);
        }

        .docs-btn-secondary {
          background: white;
          color: #334155;
          padding: 14px 32px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1.05rem;
          border: 1.5px solid #cbd5e1;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .docs-btn-secondary:hover {
          border-color: #ec4899;
          color: #ec4899;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.15);
        }

        /* Banner Brand inferior como el ejemplo */
        .docs-brand-card {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          border-radius: 24px;
          padding: 36px 28px;
          text-align: center;
          margin-top: 36px;
          box-shadow: 0 12px 35px rgba(138, 79, 88, 0.08);
          animation: docs-fadeUp 0.6s ease 0.3s both;
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 36px;
          animation: docs-fadeUp 0.6s ease 0.25s both;
        }

        .docs-card-item {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 200, 210, 0.45);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .docs-card-item:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 12px 25px rgba(236, 72, 153, 0.12);
          border-color: rgba(236, 72, 153, 0.4);
        }

        /* Modal PDF */
        .pdf-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: modal-fade 0.25s ease;
        }

        .pdf-modal-container {
          background: #ffffff;
          width: 100%;
          max-width: 1050px;
          height: 90vh;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
        }

        @keyframes docs-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes modal-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div className="docs-page">
        <Navbar />

        <main className="docs-container">
          {/* Insignias de Cabecera */}
          <div className="docs-badge-wrap">
            <span className="docs-badge">
              <span>📖</span> Centro de Documentación ReproPig
            </span>
            <span className="docs-badge">
              <span>🐷</span> Guía Operativa y Zootécnica
            </span>
          </div>

          {/* Título Principal fuera del recuadro (Igual a ¿Quiénes somos?) */}
          <h1 className="docs-title">Manual de Usuario ReproPig</h1>
          <p className="docs-subtitle">
            Conoce la guía completa, operativa y zootécnica para el manejo eficiente de la plataforma y el control reproductivo porcino.
          </p>

          {/* Tarjeta Principal */}
          <section className="docs-header-card">
            <div className="docs-card-header">
              <div className="docs-icon-circle">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <div>
                <h2 className="docs-card-title">
                  Guía General del Sistema
                </h2>
                <p className="docs-card-subtitle">
                  Documentación Técnica y Operativa
                </p>
              </div>
            </div>

            <p className="docs-description">
              Este manual de usuario presenta una guía clara y completa sobre el uso del sistema{" "}
              <strong className="text-pink-600 font-bold">ReproPig</strong>. Está dirigido a
              aprendices, pasantes, gestores, instructores y demás operarios involucrados en el proceso reproductivo de la producción
              porcícola, proporcionando instrucciones detalladas sobre cada módulo (Gestión de
              Porcinos, Razas, Ciclos Reproductivos, Montas, Colectas Seminales, Inseminación
              Artificial, Medicamentos, Partos, Seguimiento de Cerdas y Camadas, Calendario y Novedades),
              con el objetivo de facilitar la comprensión y el control integral del proceso reproductivo
              porcino.
            </p>

            {/* Badges de Información */}
            <div className="docs-meta-tags">
              <span className="docs-meta-pill">
                <i className="fa-regular fa-calendar-days text-pink-600"></i>
                Actualizado el 18 de septiembre de 2026
              </span>
              <span className="docs-meta-pill">
                <i className="fa-solid fa-users text-pink-600"></i>
                Equipo de Desarrollo ReproPig · SENA ADSO
              </span>
              <span className="docs-meta-pill bg-pink-100/60 text-pink-800 border-pink-200">
                <i className="fa-solid fa-file-pdf text-pink-600"></i>
                Documento Oficial PDF (4 Páginas)
              </span>
            </div>

            {/* Botones de Acción */}
            <div className="docs-btn-group">
              <button onClick={handleVerPdf} className="docs-btn-primary">
                <i className="fa-solid fa-up-right-from-square"></i>
                Ver PDF
              </button>

              <button onClick={handleDescargarPdf} className="docs-btn-secondary">
                <i className="fa-solid fa-download"></i>
                Descargar
              </button>
            </div>
          </section>

          {/* Resumen de Módulos Cubiertos en el Manual */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-[#8a4f58] font-['Nunito'] mb-2">
              Contenido y Módulos del Sistema
            </h2>
            <p className="text-sm font-semibold text-pink-700 max-w-lg mx-auto">
              Todo lo que necesitas saber para operar la plataforma y asegurar la máxima productividad de la piara.
            </p>
          </div>

          <div className="docs-grid">
            {modulosGuia.map((item, index) => (
              <div key={index} className="docs-card-item">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center text-lg shadow-sm`}>
                    <i className={item.icono}></i>
                  </div>
                  <h3 className="font-extrabold text-[#8a4f58] font-['Nunito'] text-base">
                    {item.titulo}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Banner de Marca ReproPig (Similar al pie del ejemplo) */}
          <section className="docs-brand-card">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={logo} alt="ReproPig Logo" className="h-10 w-auto" />
              <span className="text-2xl font-extrabold tracking-tight text-[#8a4f58] font-['Nunito']">
                Repro<span className="text-pink-500">Pig</span>
              </span>
            </div>

            <p className="text-sm sm:text-base font-medium text-gray-700 max-w-xl mx-auto mb-4">
              Con un solo clic, automatiza los registros de tu granja porcícola y olvídate del papeleo.{" "}
              <strong className="text-pink-600 font-bold">ReproPig lo hace por ti.</strong>
            </p>

            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto text-xs font-bold shadow-inner">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </section>

          {/* Botones de navegación adicionales */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#8a4f58] font-bold text-sm border border-pink-200 shadow-sm transition-all hover:-translate-y-0.5"
            >
              ← Volver al Inicio
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md shadow-pink-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              Ingresar al Sistema <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </main>

        <Footer />
      </div>

      {/* MODAL VISOR DE PDF */}
      {modalPdfOpen && (
        <div className="pdf-modal-overlay" onClick={() => setModalPdfOpen(false)}>
          <div
            className="pdf-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-file-pdf text-pink-400 text-lg"></i>
                <span className="font-bold text-sm sm:text-base">
                  Manual_de_Usuario_ReproPig.pdf
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDescargarPdf}
                  className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                  title="Descargar PDF"
                >
                  <i className="fa-solid fa-download"></i>
                  <span className="hidden sm:inline">Descargar</span>
                </button>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                  title="Abrir en pestaña nueva"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  <span className="hidden sm:inline">Pestaña Nueva</span>
                </a>
                <button
                  onClick={() => setModalPdfOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Cerrar visor"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>
            </div>

            {/* Contenido iframe con el PDF */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                title="Manual de Usuario ReproPig"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Documentos
