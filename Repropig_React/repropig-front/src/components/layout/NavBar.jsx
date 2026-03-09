import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const isLanding = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register"
  const [menuOpen, setMenuOpen] = useState(false);

  const logoColor = isLanding ? "#3D2E30" : "white";
  const linkColor = isLanding ? "#6B4B50" : "white";

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <style>{`
        .rp-navbar {
          position: fixed; top: 0; width: 100%; z-index: 1000;
          transition: all 0.3s ease; backdrop-filter: blur(12px);
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
          max-width: 1300px; margin: auto; padding: 0 24px;
          height: 70px; display: flex; align-items: center;
          justify-content: space-between;
        }
        .rp-logo {
          font-weight: bold; font-size: 1.2rem;
          text-decoration: none; color: ${logoColor};
        }
        .rp-links {
          display: flex; gap: 20px; list-style: none; margin: 0; padding: 0;
          align-items: center;
        }
        .rp-link {
          text-decoration: none; font-weight: 500;
          transition: 0.2s; color: ${linkColor};
        }
        .rp-link:hover { opacity: 0.8; }
        .rp-btn {
          padding: 7px 16px; border-radius: 8px;
          text-decoration: none; font-weight: 600; transition: 0.2s;
          font-size: 0.9rem;
        }
        .rp-btn-outline {
          border: 2px solid ${isLanding ? '#C97A85' : 'white'};
          color: ${isLanding ? '#C97A85' : 'white'};
          background: transparent;
        }
        .rp-btn-outline:hover { opacity: 0.8; }
        .rp-btn-solid {
          background: ${isLanding ? 'linear-gradient(135deg, #E8A0A8, #C97A85)' : 'white'};
          color: ${isLanding ? 'white' : '#C97A85'};
          border: none;
        }
        .rp-btn-solid:hover { transform: translateY(-1px); }
        .rp-usuario {
          display: flex; align-items: center; gap: 10px;
          color: white; font-weight: 500; font-size: 0.9rem;
        }
        .rp-hamburger {
          display: none; cursor: pointer; font-size: 24px;
          color: ${logoColor}; background: none; border: none;
        }
        .rp-mobile-menu {
          display: none; flex-direction: column;
          background: ${isLanding ? 'rgba(255,248,246,0.97)' : 'linear-gradient(135deg, #E8A0A8, #C97A85)'};
          padding: 16px 24px; gap: 12px;
          border-top: 1px solid rgba(0,0,0,0.1);
        }
        .rp-mobile-menu.open { display: flex; }
        .rp-mobile-menu a, .rp-mobile-menu button {
          text-decoration: none; font-weight: 500;
          color: ${linkColor}; padding: 8px 0;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          background: none; border-left: none; border-right: none; border-top: none;
          text-align: left; cursor: pointer;
        }
        .rp-mobile-menu a:last-child, .rp-mobile-menu button:last-child { border-bottom: none; }
        @media (max-width: 992px) {
          .rp-links { display: none; }
          .rp-hamburger { display: block; }
        }
      `}</style>

      <nav className={`rp-navbar ${isLanding ? "rp-landing" : "rp-dashboard"}`}>
        <div className="rp-container">
          <Link to={usuario ? "/home" : "/"} className="rp-logo"><img src={logo} alt="ReproPig" style={{ height: "130px", objectFit: "contain" }} /></Link>

          {/* Links desktop */}
          {!usuario ? (
            // Sin sesión — landing links
            <ul className="rp-links">
              <li><a href="#modulos" className="rp-link">Módulos</a></li>
              <li><Link to="/login" className="rp-btn rp-btn-outline">Iniciar sesión</Link></li>
              <li><Link to="/login?modo=register" className="rp-btn rp-btn-solid">Registrarse</Link></li>
            </ul>
          ) : (
            // Con sesión — módulos + usuario
            <ul className="rp-links">
              <li><NavLink to="/home" className="rp-link">Inicio</NavLink></li>
              <li><NavLink to="/porcinos" className="rp-link">Porcinos</NavLink></li>
              <li><NavLink to="/montas" className="rp-link">Montas</NavLink></li>
              <li><NavLink to="/inseminaciones" className="rp-link">Inseminación</NavLink></li>
              <li><NavLink to="/colectas" className="rp-link">Colecta</NavLink></li>
              <li><NavLink to="/medicamentos" className="rp-link">Medicamentos</NavLink></li>
              <li><NavLink to="/reproducciones" className="rp-link">Reproducciones</NavLink></li>
              <li><NavLink to="/responsables" className="rp-link">Responsables</NavLink></li>
              <li>
                <div className="rp-usuario">
                  <span>👤 {usuario.nombres}</span>
                  <button className="rp-btn rp-btn-solid" onClick={handleLogout}
                    style={{ cursor: 'pointer' }}>
                    Salir
                  </button>
                </div>
              </li>
            </ul>
          )}

          <button className="rp-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Menú móvil */}
        <div className={`rp-mobile-menu ${menuOpen ? 'open' : ''}`}>
          {!usuario ? (
            <>
              <a href="#modulos" onClick={() => setMenuOpen(false)}>Módulos</a>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
              <Link to="/login?modo=register" onClick={() => setMenuOpen(false)}>Registrarse</Link>
            </>
          ) : (
            <>
              <NavLink to="/home" onClick={() => setMenuOpen(false)}>Inicio</NavLink>
              <NavLink to="/porcinos" onClick={() => setMenuOpen(false)}>Porcinos</NavLink>
              <NavLink to="/montas" onClick={() => setMenuOpen(false)}>Montas</NavLink>
              <NavLink to="/inseminaciones" onClick={() => setMenuOpen(false)}>Inseminación</NavLink>
              <NavLink to="/colectas" onClick={() => setMenuOpen(false)}>Colecta</NavLink>
              <NavLink to="/medicamentos" onClick={() => setMenuOpen(false)}>Medicamentos</NavLink>
              <NavLink to="/reproducciones" onClick={() => setMenuOpen(false)}>Reproducciones</NavLink>
              <NavLink to="/responsables" onClick={() => setMenuOpen(false)}>Responsables</NavLink>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}>Cerrar sesión</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}