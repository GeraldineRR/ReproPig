import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (

    <nav className="h-16 bg-gradient-to-r from-[#E8A0A8] to-[#C97A85] flex items-center justify-between px-6 text-white shadow">

      {/* LOGO */}
      <div
        onClick={() => navigate(usuario ? "/dashboard" : "/")}
        className="flex items-center gap-3 cursor-pointer"
      >
        <img
          src={logo}
          alt="ReproPig"
          className="h-9 w-auto"
        />

        <h1 className="text-xl font-bold tracking-wide">
          ReproPig
        </h1>
      </div>

      <div className="flex items-center gap-4">

        {usuario ? (
          <>
            <span className="text-sm">
              👤 {usuario?.nombres}
            </span>

            <button
              onClick={handleLogout}
              className="bg-white text-[#C97A85] px-3 py-1 rounded-lg font-semibold hover:opacity-90"
            >
              Salir
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-[#C97A85] px-3 py-1 rounded-lg font-semibold hover:opacity-90"
          >
            Iniciar sesión
          </button>
        )}

      </div>

    </nav>
  );
}