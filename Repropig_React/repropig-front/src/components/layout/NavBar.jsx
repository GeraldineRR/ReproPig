import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link to="/" className="text-2xl font-bold text-rose-600">
          Repropig
        </Link>

        <div className="hidden md:flex gap-8 text-slate-700 font-medium">
          <Link to="/" className="hover:text-rose-600 transition">
            Inicio
          </Link>
          <a href="#modulos" className="hover:text-rose-600 transition">
            Módulos
          </a>
          <Link to="/dashboard" className="hover:text-rose-600 transition">
            Gestiones
          </Link>
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="text-slate-700 hover:text-rose-600 transition"
          >
            Iniciar sesión
          </Link>

          <Link
            to="/register"
            className="bg-rose-600 text-white px-4 py-2 rounded-xl hover:bg-rose-700 transition shadow-md"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar