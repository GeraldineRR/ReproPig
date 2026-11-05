import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import NotificacionesCamada from "./NotificacionesCamada";

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const navLinks = [
    { label: "Inicio", path: "/", icon: "fa-solid fa-home" },
    { label: "¿Quiénes somos?", path: "/quienes-somos", icon: "fa-solid fa-users" },
    { label: "Documentos", path: "/documentos", icon: "fa-solid fa-file-lines" },
    { label: "Contáctanos", path: "/contactanos", icon: "fa-solid fa-envelope" },
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="bg-gradient-to-r from-[#ffe4e8] to-[#fcebf0] border-b border-pink-100 text-[#8a4f58] sticky top-0 z-50 shadow-xs">
      <div className="h-16 flex items-center justify-between px-3 sm:px-6">

        {/* Lado izquierdo: Botón sidebar (si autenticado) + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {usuario && (
            <button
              onClick={onToggleSidebar}
              className="text-gray-600 hover:text-pink-600 hover:bg-pink-100/60 rounded-xl w-10 h-10 flex items-center justify-center transition-colors text-lg cursor-pointer"
              title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          )}

          {/* Logo y Nombre */}
          <div
            onClick={() => navigate(usuario ? "/dashboard" : "/")}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <img src={logo} alt="ReproPig" className="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
            <h1 className="text-lg sm:text-xl font-extrabold tracking-wide text-[#8a4f58]">
              ReproPig
            </h1>
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Navegación pública Desktop */}
          {!usuario && (
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2 mr-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`font-bold transition-all px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer ${
                    location.pathname === link.path
                      ? "text-pink-600 bg-white/80 shadow-xs"
                      : "text-[#8a4f58] hover:text-pink-600 hover:bg-white/40"
                  }`}
                >
                  <i className={`${link.icon} text-xs`}></i>
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Si usuario logueado */}
          {usuario ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificacionesCamada />

              <button
                onClick={() => navigate("/mi-perfil")}
                className="flex items-center gap-2 sm:gap-3 hover:bg-white/40 p-1 rounded-2xl transition-colors cursor-pointer text-left"
                title="Ir a mi perfil"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-tight">{usuario?.nombres}</p>
                  <p className="text-xs text-pink-500 font-bold capitalize">{usuario?.cargo || 'Operario'}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-pink-600 flex items-center justify-center font-black shadow-xs border border-pink-100 text-sm sm:text-base">
                  {usuario?.nombres ? usuario.nombres.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-xl transition-colors border border-gray-100 shadow-xs cursor-pointer"
                title="Cerrar sesión"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="bg-pink-500 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm hover:bg-pink-600 transition-colors shadow-xs shadow-pink-200 cursor-pointer"
              >
                Iniciar sesión
              </button>

              {/* Botón hamburguesa móvil cuando no está logueado */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="md:hidden text-[#8a4f58] hover:text-pink-600 bg-white/60 p-2 rounded-xl w-9 h-9 flex items-center justify-center border border-pink-100 cursor-pointer"
                aria-label="Abrir menú"
              >
                <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-base`}></i>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Menú desplegable móvil para landing/visitantes */}
      {!usuario && mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-pink-100 px-4 py-3 space-y-1 shadow-lg animate-fade-in-down">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`w-full text-left font-bold px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                location.pathname === link.path
                  ? "bg-pink-50 text-pink-600"
                  : "text-gray-700 hover:bg-pink-50/50 hover:text-pink-600"
              }`}
            >
              <i className={`${link.icon} text-pink-500 w-5 text-center`}></i>
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
