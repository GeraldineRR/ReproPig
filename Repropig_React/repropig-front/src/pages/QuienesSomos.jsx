import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../layout/Footer"
import logo from "../assets/logo.png"

function QuienesSomos() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

        .qs-page {
          min-height: 100vh;
          background: linear-gradient(120deg, #F7A8B8 0%, #FBBFD0 25%, #FDD5C0 60%, #FDE8D8 100%);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }

        .qs-container {
          flex: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 50px 24px 80px;
          width: 100%;
        }

        .qs-badge-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .qs-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          color: #B05068;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(176, 80, 104, 0.08);
          animation: qs-fadeUp 0.5s ease both;
        }

        .qs-[#8a4f58] {
          color: #8a4f58;
        }

        .qs-title {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900;
          color: #8a4f58;
          text-align: center;
          line-height: 1.15;
          margin-bottom: 16px;
          animation: qs-fadeUp 0.55s ease 0.1s both;
        }

        .qs-subtitle {
          font-size: 1.15rem;
          color: #5A333E;
          text-align: center;
          font-weight: 600;
          max-width: 750px;
          margin: 0 auto 40px;
          line-height: 1.6;
          animation: qs-fadeUp 0.55s ease 0.2s both;
        }

        /* Tarjeta Principal */
        .qs-main-card {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(138, 79, 88, 0.12);
          margin-bottom: 40px;
          animation: qs-fadeUp 0.6s ease 0.3s both;
          position: relative;
          overflow: hidden;
        }

        .qs-main-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #ec4899, #f43f5e, #fb7185);
        }

        .qs-card-text {
          font-size: 1.18rem;
          color: #3d2532;
          line-height: 1.85;
          font-weight: 500;
          text-align: justify;
        }

        /* Cuadrícula de Pilares */
        .qs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 20px;
          margin-bottom: 50px;
          animation: qs-fadeUp 0.65s ease 0.4s both;
        }

        .qs-pillar-card {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 200, 210, 0.5);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .qs-pillar-card:hover {
          transform: translateY(-6px);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 12px 25px rgba(236, 72, 153, 0.15);
          border-color: rgba(236, 72, 153, 0.4);
        }

        .qs-pillar-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #ffe4e8;
          color: #ec4899;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-bottom: 16px;
        }

        .qs-pillar-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #8a4f58;
          margin-bottom: 8px;
        }

        .qs-pillar-desc {
          font-size: 0.9rem;
          color: #6b4d57;
          line-height: 1.5;
        }

        /* Botones de Acción */
        .qs-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          animation: qs-fadeUp 0.7s ease 0.5s both;
        }

        .qs-btn-primary {
          background: #ec4899;
          color: white;
          padding: 14px 32px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.25);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qs-btn-primary:hover {
          background: #db2777;
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(236, 72, 153, 0.35);
        }

        .qs-btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          color: #8a4f58;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1.05rem;
          border: 1px solid rgba(138, 79, 88, 0.2);
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qs-btn-secondary:hover {
          background: white;
          color: #ec4899;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }

        @keyframes qs-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="qs-page">
        <Navbar />

        <main className="qs-container">
          {/* Insignias de Cabecera */}
          <div className="qs-badge-wrap">
            <span className="qs-badge">
              <span>🌱</span> SENA - Centro Agropecuario “La Granja”
            </span>
            <span className="qs-badge">
              <span>💻</span> Tecnólogo en Análisis y Desarrollo de Software
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="qs-title">¿Quiénes somos?</h1>
          <p className="qs-subtitle">
            Conoce al equipo detrás de <strong>ReproPig</strong>, dedicados a la innovación tecnológica y al desarrollo de soluciones software de alto valor.
          </p>

          {/* Card Principal con el Texto del Usuario */}
          <div className="qs-main-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 text-2xl shadow-inner">
                🎓
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#8a4f58] font-['Nunito']">
                  Nuestro Equipo
                </h2>
                <p className="text-sm font-semibold text-pink-500">
                  Aprendices SENA ADSO
                </p>
              </div>
            </div>

            <p className="qs-card-text">
              Somos aprendices del Tecnólogo en Análisis y Desarrollo de Software del SENA, Centro Agropecuario “La Granja”. Nos motiva la tecnología y el trabajo en equipo, desarrollando soluciones innovadoras y funcionales que aporten valor. A través de la colaboración, la práctica y el aprendizaje constante, buscamos fortalecer nuestras competencias y mejorar continuamente nuestras capacidades en el área del desarrollo de software.
            </p>
          </div>

          {/* Tarjetas de Pilares */}
          <div className="qs-grid">
            <div className="qs-pillar-card">
              <div className="qs-pillar-icon">🚀</div>
              <h3 className="qs-pillar-title">Innovación Digital</h3>
              <p className="qs-pillar-desc">
                Creamos plataformas inteligentes orientadas a la optimización de procesos reales.
              </p>
            </div>

            <div className="qs-pillar-card">
              <div className="qs-pillar-icon">🤝</div>
              <h3 className="qs-pillar-title">Trabajo Colaborativo</h3>
              <p className="qs-pillar-desc">
                Sumamos fortalezas en equipo para lograr soluciones sólidas y funcionales.
              </p>
            </div>

            <div className="qs-pillar-card">
              <div className="qs-pillar-icon">📈</div>
              <h3 className="qs-pillar-title">Mejora Continua</h3>
              <p className="qs-pillar-desc">
                Evolucionamos nuestras prácticas de código mediante la experiencia y la constante práctica.
              </p>
            </div>

            <div className="qs-pillar-card">
              <div className="qs-pillar-icon">🏛️</div>
              <h3 className="qs-pillar-title">Orgullo SENA</h3>
              <p className="qs-pillar-desc">
                Formados con calidad técnica y sentido de responsabilidad social en el sector agropecuario.
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="qs-actions">
            <button onClick={() => navigate("/")} className="qs-btn-secondary">
              ← Volver al Inicio
            </button>
            <button onClick={() => navigate("/login")} className="qs-btn-primary">
              Iniciar Sesión <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}

export default QuienesSomos
