import logo from "../assets/logo.png";

function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .rp-footer {
          background: #2d1b2e;
          color: rgba(255,255,255,0.7);
          padding: 60px 24px 30px;
          font-family: 'Inter', sans-serif;
          text-align: center;
        }

        .rp-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .rp-footer-logo img {
          height: 32px;
          width: auto;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
        }

        .rp-footer-name {
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .rp-footer-name span { color: #E8A0A8; }

        .rp-footer-tagline {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.6);
          margin-bottom: 32px;
          font-weight: 400;
        }

        .rp-footer-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 0 auto 24px;
          max-width: 500px;
        }

        .rp-footer-copy {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
        }
      `}</style>

      <footer className="rp-footer">

        <div className="rp-footer-logo">
          <img src={logo} alt="ReproPig Logo" />
          <span className="rp-footer-name">Repro<span>Pig</span></span>
        </div>

        <p className="rp-footer-tagline">
          Sistema Integral de Gestión Reproductiva Porcina
        </p>

        <hr className="rp-footer-divider" />

        <p className="rp-footer-copy">
          © {new Date().getFullYear()} ReproPig. Todos los derechos reservados.
        </p>

      </footer>
    </>
  )
}

export default Footer