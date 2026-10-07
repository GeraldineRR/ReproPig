import { NavLink } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { 
  TbHome, TbPig, TbChevronDown, TbActivityHeartbeat, 
  TbStethoscope, TbUsers, TbMilk, TbAlertTriangle, TbCalendar
} from 'react-icons/tb'

export default function Sidebar({ isOpen }) {
  const [animalesOpen, setAnimalesOpen] = useState(true)
  const [reproOpen, setReproOpen] = useState(true)
  const [maternidadOpen, setMaternidadOpen] = useState(true)
  const [novedadesOpen, setNovedadesOpen] = useState(false)
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
      className={`bg-white border-r border-gray-100 h-full transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-40 shrink-0 ${isOpen ? "w-72 overflow-y-auto fixed left-0 top-16 bottom-0 md:relative md:top-0 md:w-72" : "w-0 opacity-0 overflow-hidden pointer-events-none md:relative md:top-0 md:w-0 md:opacity-0 md:pointer-events-none"
        }`}
    >
      <nav className="flex flex-col gap-1 py-4 pb-32">

        <NavLink to="/dashboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
          <TbHome className="w-5 h-5" /> Inicio
        </NavLink>

        {/* 1. Plantel Porcino (Animales) */}
        <div>
          <button className={buttonClass} onClick={() => setAnimalesOpen(!animalesOpen)}>
            <div className="flex items-center gap-2">
              <TbPig className="w-5 h-5 text-pink-500" /> Plantel Porcino
            </div>
            <TbChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${animalesOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${animalesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/porcinos" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Porcinos</NavLink>
              <NavLink to="/razas" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Razas</NavLink>
            </div>
          </div>
        </div>

        {/* 2. Reproducción & Ciclos */}
        <div>
          <button className={buttonClass} onClick={() => setReproOpen(!reproOpen)}>
            <div className="flex items-center gap-2">
              <TbActivityHeartbeat className="w-5 h-5 text-purple-500" /> Reproducción & Ciclos
            </div>
            <TbChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${reproOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${reproOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/calendario" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Calendario Reproductivo</NavLink>
              <NavLink to="/ciclos" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Ciclos Reproductivos</NavLink>
              <NavLink to="/montas" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Montas Naturales</NavLink>
              <NavLink to="/inseminaciones" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Inseminaciones</NavLink>
              <NavLink to="/colectas" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Colectas de Semen</NavLink>
            </div>
          </div>
        </div>

        {/* 3. Maternidad & Camadas */}
        <div>
          <button className={buttonClass} onClick={() => setMaternidadOpen(!maternidadOpen)}>
            <div className="flex items-center gap-2">
              <TbMilk className="w-5 h-5 text-blue-500" /> Maternidad & Camadas
            </div>
            <TbChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${maternidadOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${maternidadOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/partos" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Partos</NavLink>
              <NavLink to="/seguimiento_cerda" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Seguimiento Cerda</NavLink>
              <NavLink to="/actividades_camada" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Seguimiento Camada</NavLink>
            </div>
          </div>
        </div>

        {/* 4. Novedades & Registro */}
        <div>
          <button className={buttonClass} onClick={() => setNovedadesOpen(!novedadesOpen)}>
            <div className="flex items-center gap-2">
              <TbAlertTriangle className="w-5 h-5 text-amber-500" /> Novedades & Control
            </div>
            <TbChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${novedadesOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${novedadesOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/novedades" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Novedades</NavLink>
              <NavLink to="/actividades" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Historial de Actividades</NavLink>
            </div>
          </div>
        </div>

        {/* 5. Sanidad & Medicamentos */}
        <div>
          <button className={buttonClass} onClick={() => setSanidadOpen(!sanidadOpen)}>
            <div className="flex items-center gap-2">
              <TbStethoscope className="w-5 h-5 text-green-500" /> Sanidad & Medicamentos
            </div>
            <TbChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sanidadOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${sanidadOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="ml-5 border-l-2 border-gray-100 pl-2 flex flex-col gap-1 py-1">
              <NavLink to="/medicamentos" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>Medicamentos</NavLink>
            </div>
          </div>
        </div>

        {/* 6. Administración */}
        {(usuario?.Cargo?.toLowerCase().includes("instructor") || usuario?.cargo?.toLowerCase().includes("instructor")) && (
          <div>
            <button className={buttonClass} onClick={() => setAdminOpen(!adminOpen)}>
              <div className="flex items-center gap-2">
                <TbUsers className="w-5 h-5 text-orange-500" /> Administración
              </div>
              <TbChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${adminOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
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