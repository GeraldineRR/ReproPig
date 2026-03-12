import { NavLink } from "react-router-dom"
import { useState } from "react"

export default function Sidebar() {

  const [animalesOpen, setAnimalesOpen] = useState(false)
  const [reproOpen, setReproOpen] = useState(false)
  const [sanidadOpen, setSanidadOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  const linkClass =
    "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#E8A0A8] hover:text-white transition"

  const buttonClass =
    "flex justify-between items-center px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100"

  return (

    <aside className="w-60 bg-white border-r p-4">

      <h2 className="font-bold text-gray-600 mb-4">
        MENÚ
      </h2>

      <nav className="flex flex-col gap-1">

        {/* Inicio */}
        <NavLink to="/dashboard" className={linkClass}>
          🏠 Inicio
        </NavLink>


        {/* Animales */}
        <div>

          <div
            className={buttonClass}
            onClick={() => setAnimalesOpen(!animalesOpen)}
          >
            🐷 Animales {animalesOpen ? "▼" : "▶"}
          </div>

          {animalesOpen && (
            <div className="ml-4 flex flex-col">

              <NavLink to="/porcinos" className={linkClass}>
                Porcinos
              </NavLink>

              <NavLink to="/razas" className={linkClass}>
                Razas
              </NavLink>

            </div>
          )}

        </div>


        {/* Reproducción */}
        <div>

          <div
            className={buttonClass}
            onClick={() => setReproOpen(!reproOpen)}
          >
            🧬 Reproducción {reproOpen ? "▼" : "▶"}
          </div>

          {reproOpen && (
            <div className="ml-4 flex flex-col">
              <NavLink to="/reproducciones" className={linkClass}>
                Reproducciones
              </NavLink>

              <NavLink to="/montas" className={linkClass}>
                Montas
              </NavLink>

              <NavLink to="/inseminaciones" className={linkClass}>
                Inseminaciones
              </NavLink>

              <NavLink to="/colectas" className={linkClass}>
                Colectas
              </NavLink>

              

            </div>
          )}

        </div>


        {/* Sanidad */}
        <div>

          <div
            className={buttonClass}
            onClick={() => setSanidadOpen(!sanidadOpen)}
          >
            💊 Sanidad {sanidadOpen ? "▼" : "▶"}
          </div>

          {sanidadOpen && (
            <div className="ml-4 flex flex-col">

              <NavLink to="/medicamentos" className={linkClass}>
                Medicamentos
              </NavLink>

            </div>
          )}

        </div>


        {/* Administración */}
        <div>

          <div
            className={buttonClass}
            onClick={() => setAdminOpen(!adminOpen)}
          >
            👨‍🌾 Administración {adminOpen ? "▼" : "▶"}
          </div>

          {adminOpen && (
            <div className="ml-4 flex flex-col">

              <NavLink to="/responsables" className={linkClass}>
                Responsables
              </NavLink>

            </div>
          )}

        </div>

      </nav>

    </aside>
  )
}