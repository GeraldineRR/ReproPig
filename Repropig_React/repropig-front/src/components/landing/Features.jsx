import { Link } from "react-router-dom"

const isLoggedIn = true // ← cambia por tu hook de auth cuando esté listo

function Features() {
  const modulos = [
    // ── Disponibles ──
    { nombre: "Inseminación",         ruta: "/inseminaciones", icon: "💉", color: "#FFE4EC", accent: "#E8A0B0", desc: "Gestión profesional del módulo de inseminación con control y trazabilidad completa.",      activo: true },
    { nombre: "Colecta",              ruta: "/colectas",        icon: "🧪", color: "#E4F0FF", accent: "#A0B8E8", desc: "Gestión profesional del módulo de colecta con control y trazabilidad completa.",              activo: true },
    { nombre: "Monta",                ruta: "/montas",          icon: "🐷", color: "#FFE8E0", accent: "#E8B0A0", desc: "Gestión profesional del módulo de monta con control y trazabilidad completa.",                activo: true },
    { nombre: "Medicamentos",         ruta: "/medicamentos",    icon: "💊", color: "#E8F4E4", accent: "#A0C8A0", desc: "Gestión profesional del módulo de medicamentos con control y trazabilidad completa.",        activo: true },
    { nombre: "Reproducciones",       ruta: "/reproducciones",  icon: "🔬", color: "#FFF4E0", accent: "#E8C880", desc: "Gestión profesional del módulo de reproducciones con control y trazabilidad completa.",      activo: true },
    { nombre: "Responsables",         ruta: "/responsables",    icon: "👤", color: "#F0F4FF", accent: "#A0B0E8", desc: "Gestión de responsables y roles del sistema porcícola.",                                    activo: true },
    // ── Próximamente ──
    { nombre: "Porcinos",             ruta: null,               icon: "🐖", color: "#F4F0FF", accent: "#C0A0E8", desc: "Registro y seguimiento completo de los porcinos de la granja.",                             activo: false },
    { nombre: "Partos",               ruta: null,               icon: "🍼", color: "#FFF0F4", accent: "#E8A0B8", desc: "Control detallado de partos, camadas y registro de nacimientos.",                           activo: false },
    { nombre: "Historial",            ruta: null,               icon: "📋", color: "#F4F4F0", accent: "#B0B8A0", desc: "Historial completo de eventos y registros del sistema.",                                   activo: false },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .rp-feat {
          padding: 100px 32px;
          background: #FFFAF8;
          font-family: 'DM Sans', sans-serif;
        }

        .rp-feat-inner { max-width: 1100px; margin: 0 auto; }

        .rp-feat-label {
          text-align: center; font-size: 0.72rem; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #C97A85; margin-bottom: 10px;
        }

        .rp-feat-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 700;
          text-align: center; color: #3D2E30; margin-bottom: 10px;
        }

        .rp-feat-sub {
          text-align: center; color: #9A7080; font-size: 0.92rem;
          font-weight: 300; max-width: 460px; margin: 0 auto 52px; line-height: 1.7;
        }

        .rp-feat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px;
        }
        @media (max-width: 900px) { .rp-feat-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) { .rp-feat-grid { grid-template-columns: 1fr; } }

        /* ── Card base ── */
        .rp-mcard {
          background: #fff; border: 1.5px solid #F0DCE0;
          border-radius: 20px; padding: 30px 26px 26px;
          text-decoration: none; display: block; position: relative;
          overflow: hidden; transform-style: preserve-3d;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease, border-color 0.3s ease;
        }

        /* Brillo deslizante */
        .rp-mcard::before {
          content: ''; position: absolute; top: -60%; left: -60%;
          width: 60%; height: 200%;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%);
          transform: skewX(-20deg);
          transition: left 0.55s ease; pointer-events: none; z-index: 2;
        }

        /* Línea superior */
        .rp-mcard::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 3px; background: var(--card-accent, #E8A0A8);
          opacity: 0; transition: opacity 0.3s; border-radius: 20px 20px 0 0;
        }

        .rp-mcard:hover { 
          transform: translateY(-8px) rotateX(4deg) rotateY(-2deg);
          box-shadow: 0 20px 50px rgba(180,80,110,0.14), 0 6px 16px rgba(180,80,110,0.08);
          border-color: var(--card-accent, #E8A0A8);
        }
        .rp-mcard:hover::before { left: 140%; }
        .rp-mcard:hover::after  { opacity: 1; }

        /* ── Card deshabilitada ── */
        .rp-mcard-disabled {
          background: #FAFAFA; border: 1.5px dashed #E8D8DC;
          border-radius: 20px; padding: 30px 26px 26px;
          display: block; position: relative; overflow: hidden;
          cursor: not-allowed; opacity: 0.7;
        }

        .rp-soon-badge {
          position: absolute; top: 16px; right: 16px;
          background: linear-gradient(135deg, #F0DCE0, #E8C8CC);
          color: #B07080; font-size: 0.65rem; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }

        /* ── Icono ── */
        .rp-mcard-icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; margin-bottom: 20px;
          background: var(--card-bg, #FFE4EC);
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2);
          position: relative; z-index: 1;
        }
        .rp-mcard:hover .rp-mcard-icon { transform: translateY(-4px) scale(1.08); }

        .rp-mcard-title {
          font-family: 'Playfair Display', serif; font-size: 1.08rem;
          font-weight: 700; color: #3D2E30; margin-bottom: 8px;
          position: relative; z-index: 1;
        }
        .rp-mcard-disabled .rp-mcard-title { color: #9A8088; }

        .rp-mcard-desc {
          font-size: 0.83rem; color: #9A7080; line-height: 1.65;
          font-weight: 300; margin-bottom: 18px; position: relative; z-index: 1;
        }

        .rp-mcard-link {
          font-size: 0.8rem; font-weight: 600;
          color: var(--card-accent, #C97A85);
          display: inline-flex; align-items: center; gap: 5px;
          transition: gap 0.25s; position: relative; z-index: 1;
        }
        .rp-mcard:hover .rp-mcard-link { gap: 10px; }

        /* Estado bloqueado */
        .rp-feat-locked {
          text-align: center; padding: 56px 24px;
          background: #fff; border: 1.5px dashed #F0DCE0;
          border-radius: 24px; max-width: 480px; margin: 0 auto;
        }
        .rp-feat-lock-icon { font-size: 3rem; margin-bottom: 16px; }
        .rp-feat-lock-title {
          font-family: 'Playfair Display', serif; font-size: 1.4rem;
          color: #3D2E30; margin-bottom: 10px; font-weight: 700;
        }
        .rp-feat-lock-desc { font-size: 0.9rem; color: #9A7080; margin-bottom: 28px; line-height: 1.65; }
        .rp-feat-lock-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .rp-btn-solid {
          background: linear-gradient(135deg, #E8A0A8, #C97A85); color: #fff;
          text-decoration: none; padding: 12px 28px; border-radius: 10px;
          font-weight: 600; font-size: 0.88rem;
          box-shadow: 0 4px 16px rgba(201,122,133,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .rp-btn-solid:hover { transform: translateY(-2px); }
        .rp-btn-ghost {
          background: transparent; color: #C97A85; text-decoration: none;
          padding: 11px 26px; border-radius: 10px; font-weight: 600;
          font-size: 0.88rem; border: 1.5px solid #E8A0A8; transition: background 0.2s;
        }
        .rp-btn-ghost:hover { background: #FDE8EC; }
      `}</style>

      <section id="modulos" className="rp-feat">
        <div className="rp-feat-inner">
          <div className="rp-feat-label">Plataforma</div>
          <h2 className="rp-feat-title">Módulos del Sistema</h2>
          <p className="rp-feat-sub">
            Cada módulo está diseñado para una gestión precisa, con trazabilidad y control total del proceso reproductivo.
          </p>

          {isLoggedIn ? (
            <div className="rp-feat-grid">
              {modulos.map((mod, i) =>
                mod.activo ? (
                  <Link
                    key={i} to={mod.ruta} className="rp-mcard"
                    style={{ "--card-bg": mod.color, "--card-accent": mod.accent }}
                  >
                    <div className="rp-mcard-icon" style={{ "--card-bg": mod.color }}>{mod.icon}</div>
                    <div className="rp-mcard-title">{mod.nombre}</div>
                    <div className="rp-mcard-desc">{mod.desc}</div>
                    <span className="rp-mcard-link">Ir al módulo →</span>
                  </Link>
                ) : (
                  <div
                    key={i} className="rp-mcard-disabled"
                    style={{ "--card-bg": mod.color, "--card-accent": mod.accent }}
                  >
                    <span className="rp-soon-badge">Próximamente</span>
                    <div className="rp-mcard-icon" style={{ background: mod.color }}>{mod.icon}</div>
                    <div className="rp-mcard-title">{mod.nombre}</div>
                    <div className="rp-mcard-desc">{mod.desc}</div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="rp-feat-locked">
              <div className="rp-feat-lock-icon">🔒</div>
              <div className="rp-feat-lock-title">Acceso exclusivo</div>
              <p className="rp-feat-lock-desc">
                Los módulos del sistema están disponibles solo para usuarios registrados.
                Inicia sesión o crea tu cuenta para acceder.
              </p>
              <div className="rp-feat-lock-btns">
                <Link to="/login"    className="rp-btn-solid">Iniciar sesión</Link>
                <Link to="/register" className="rp-btn-ghost">Registrarse</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Features