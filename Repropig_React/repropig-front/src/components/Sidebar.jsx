import { NavLink } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function Sidebar({ isOpen }) {
  const [animalesOpen, setAnimalesOpen] = useState(true)
  const [reproOpen, setReproOpen] = useState(true)
  const [sanidadOpen, setSanidadOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const { usuario } = useAuth()

  // Estilos modernos para los enlaces
  const linkClass = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-all font-medium text-sm whitespace-nowrap mx-2 my-1"
  const activeClass = "bg-pink-500 text-white shadow-md shadow-pink-200 hover:bg-pink-600 hover:text-white"
  
  // Estilos para los botones desplegables
  const buttonClass = "flex justify-between items-center px-4 py-3 mt-2 rounded-xl cursor-pointer text-gray-700 hover:bg-gray-50 w-[calc(100%-1rem)] mx-2 text-left whitespace-nowrap font-bold text-sm transition-colors"

  return (
    <aside
      className={`bg-white border-r border-gray-100 h-full transition-all duration-300 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20 ${
        isOpen ? "w-72" : "w-0 opacity-0"
      }`}
    >
      <nav className="flex flex-col gap-1 py-4">

        <NavLink to="/dashboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
          <i className="fa-solid fa-house w-5 text-center"></i> Inicio
        </NavLink>

        {/* Animales */}
        <div>
          <button className={buttonClass} onClick={() => setAnimalesOpen(!animalesOpen)}>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-piggy-bank text-pink-500 w-5 text-center"></i> Animales
            </div>
            <i className={`fa-solid fa-chevron-down text-xs transition-transform text-gray-400 ${animalesOpen ? 'rotate-180' : ''}`}></i>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${animalesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/razas" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Razas</NavLink>
              <NavLink to="/porcinos" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Porcinos</NavLink>
              {/* <NavLink to="/crias" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Crías</NavLink> */}
            </div>
          </div>
        </div>

        {/* Reproducción */}
        <div>
          <button className={buttonClass} onClick={() => setReproOpen(!reproOpen)}>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-dna text-purple-500 w-5 text-center"></i> Reproducción
            </div>
            <i className={`fa-solid fa-chevron-down text-xs transition-transform text-gray-400 ${reproOpen ? 'rotate-180' : ''}`}></i>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${reproOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/reproducciones" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Reproducciones</NavLink>
              <NavLink to="/montas" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Montas</NavLink>
              <NavLink to="/colectas" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Colectas</NavLink>
              <NavLink to="/inseminaciones" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Inseminaciones</NavLink>
              <NavLink to="/partos" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Partos</NavLink>
              <NavLink to="/seguimiento_cerda" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Seguimiento Cerda</NavLink>
              {/* <NavLink to="/segcamada" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Seg. Camada</NavLink> */}
            </div>
          </div>
        </div>

        {/* Sanidad */}
        <div>
          <button className={buttonClass} onClick={() => setSanidadOpen(!sanidadOpen)}>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-kit-medical text-green-500 w-5 text-center"></i> Sanidad
            </div>
            <i className={`fa-solid fa-chevron-down text-xs transition-transform text-gray-400 ${sanidadOpen ? 'rotate-180' : ''}`}></i>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${sanidadOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/medicamentos" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Medicamentos</NavLink>
            </div>
          </div>
        </div>

        {/* Administración */}
        {usuario?.cargo === "instructor" && (
          <div>
            <button className={buttonClass} onClick={() => setAdminOpen(!adminOpen)}>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-users-gear text-orange-500 w-5 text-center"></i> Administración
              </div>
              <i className={`fa-solid fa-chevron-down text-xs transition-transform text-gray-400 ${adminOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${adminOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
                <NavLink to="/responsables" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Responsables</NavLink>
              </div>
            </div>
          </div>
        )}

      </nav>
    </aside>
  )
}