import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar({ sidebarOpen, onToggleSidebar }) {

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="h-16 bg-gradient-to-r from-[#ffe4e8] to-[#fcebf0] border-b border-pink-100 flex items-center justify-between px-6 text-[#8a4f58] sticky top-0 z-50 shadow-sm">

      <div className="flex items-center gap-3">

        {/* ☰ Botón toggle */}
        {usuario && (
          <button
            onClick={onToggleSidebar}
            className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl w-10 h-10 flex items-center justify-center transition-colors text-lg"
            title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        )}

        {/* Logo */}
        <div
          onClick={() => navigate(usuario ? "/dashboard" : "/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src={logo} alt="ReproPig" className="h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
          <h1 className="text-xl font-extrabold tracking-wide text-[#8a4f58]">
            ReproPig
          </h1>
        </div>

      </div>

      <div className="flex items-center gap-4">
        {usuario ? (
          <>
            <button 
              onClick={() => navigate("/mi-perfil")}
              className="flex items-center gap-3 mr-4 hover:bg-white/40 p-1.5 rounded-2xl transition-colors cursor-pointer text-left"
              title="Ir a mi perfil"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-tight">{usuario?.nombres}</p>
                <p className="text-xs text-pink-500 font-bold capitalize">{usuario?.cargo || 'Operario'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center font-black shadow-sm border border-pink-100">
                {usuario?.nombres ? usuario.nombres.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-xl transition-colors border border-gray-100 shadow-sm"
              title="Cerrar sesión"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-pink-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-sm shadow-pink-200"
          >
            Iniciar sesión
          </button>
        )}
      </div>

    </nav>
  );
}