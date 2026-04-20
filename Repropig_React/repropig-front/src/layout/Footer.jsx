function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

        .rp-footer {
          background: #2E2022;
          color: rgba(255,255,255,0.6);
          padding: 48px 24px 28px;
          font-family: 'DM Sans', sans-serif;
          text-align: center;
        }

        .rp-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .rp-footer-pill {
          background: linear-gradient(135deg, #E8A0A8, #C97A85);
          border-radius: 8px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
        }

        .rp-footer-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
        }

        .rp-footer-name span { color: #E8A0A8; }

        .rp-footer-tagline {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
          margin-bottom: 28px;
          font-weight: 300;
        }

        .rp-footer-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 0 auto 20px;
          max-width: 400px;
        }

        .rp-footer-copy {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.28);
        }
      `}</style>

      <footer className="rp-footer">

        <div className="rp-footer-logo">
          <div className="rp-footer-pill">🐷</div>
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