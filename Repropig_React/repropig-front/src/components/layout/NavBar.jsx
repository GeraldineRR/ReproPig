import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .rp-navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.3s ease;
          backdrop-filter: blur(12px);
        }

        .rp-landing {
          background: rgba(255, 248, 246, 0.9);
          border-bottom: 1px solid #F2D9DC;
        }

        .rp-dashboard {
          background: linear-gradient(135deg, #E8A0A8, #C97A85);
          color: white;
        }

        .rp-container {
          max-width: 1300px;
          margin: auto;
          padding: 0 24px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rp-logo {
          font-weight: bold;
          font-size: 1.2rem;
          text-decoration: none;
          color: ${isLanding ? "#3D2E30" : "white"};
        }

        .rp-links {
          display: flex;
          gap: 24px;
          list-style: none;
        }

        .rp-link {
          text-decoration: none;
          font-weight: 500;
          transition: 0.2s;
          color: ${isLanding ? "#6B4B50" : "white"};
        }

        .rp-link:hover {
          opacity: 0.8;
          transform: translateY(-2px);
        }

        .rp-btn {
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
        }

        .rp-btn-solid {
          background: ${isLanding ? "linear-gradient(135deg, #E8A0A8, #C97A85)" : "white"};
          color: ${isLanding ? "white" : "#C97A85"};
        }

        .rp-btn-solid:hover {
          transform: translateY(-2px);
        }

        .rp-hamburger {
          display: none;
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .rp-links {
            display: none;
          }

          .rp-hamburger {
            display: block;
            font-size: 24px;
            color: ${isLanding ? "#3D2E30" : "white"};
          }
        }
      `}</style>

      <nav className={`rp-navbar ${isLanding ? "rp-landing" : "rp-dashboard"}`}>
        <div className="rp-container">

          <Link to="/" className="rp-logo">
            🐷 ReproPig
          </Link>

          {isLanding ? (
            <ul className="rp-links">
              <li><a href="#modulos" className="rp-link">Módulos</a></li>
              <li><Link to="/login" className="rp-link">Iniciar sesión</Link></li>
              <li>
                <Link to="/register" className="rp-btn rp-btn-solid">
                  Registrarse
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="rp-links">
              <li><NavLink to="/Hero" className="rp-link">Inicio</NavLink></li>
              <li><NavLink to="/porcinos" className="rp-link">Porcinos</NavLink></li>
              <li><NavLink to="/montas" className="rp-link">Montas</NavLink></li>
              <li><NavLink to="/inseminaciones" className="rp-link">Inseminación</NavLink></li>
              <li><NavLink to="/colectas" className="rp-link">Colecta</NavLink></li>
              <li><NavLink to="/medicamentos" className="rp-link">Medicamentos</NavLink></li>
              <li><NavLink to="/reproducciones" className="rp-link">Reproducciones</NavLink></li>
              <li><NavLink to="/responsables" className="rp-link">Responsables</NavLink></li>
            </ul>
          )}

          <div className="rp-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>

        </div>
      </nav>
    </>
  );
}