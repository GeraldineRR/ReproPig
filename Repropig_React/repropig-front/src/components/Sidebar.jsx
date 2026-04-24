import { NavLink } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function Sidebar() {

  const [animalesOpen, setAnimalesOpen] = useState(true)
  const [reproOpen, setReproOpen] = useState(false)
  const [sanidadOpen, setSanidadOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const { usuario } = useAuth()

  const linkClass =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-[#E8A0A8] hover:text-white transition"

  const activeClass =
    "bg-[#E8A0A8] text-white"

  const buttonClass =
    "flex justify-between items-center px-4 py-2 rounded-lg cursor-pointer text-gray-700 hover:bg-gray-100"

  return (

    <aside className="w-60 bg-white border-r min-h-screen p-4">

      {/* Título */}
      <h2 className="font-bold text-gray-600 mb-6">
        MENÚ
      </h2>

      <nav className="flex flex-col gap-2">

        {/* Dashboard */}

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          🏠 Inicio
        </NavLink>


        {/* Animales */}

        <div>

          <div
            className={buttonClass}
            onClick={() => setAnimalesOpen(!animalesOpen)}
          >
            🐷 Animales
            <span>{animalesOpen ? "▼" : "▶"}</span>
          </div>

          {animalesOpen && (

            <div className="ml-4 flex flex-col gap-1">

              <NavLink
                to="/porcinos"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                Porcinos
              </NavLink>

              <NavLink
                to="/razas"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                Razas
              </NavLink>

              <NavLink to="/crias" className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }>
                Crías
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
            🧬 Reproducción
            <span>{reproOpen ? "▼" : "▶"}</span>
          </div>

          {reproOpen && (

            <div className="ml-4 flex flex-col gap-1">

              <NavLink
                to="/reproducciones"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                Reproducciones
              </NavLink>

              <NavLink
                to="/montas"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                Montas
              </NavLink>

              <NavLink
                to="/colectas"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                Colectas
              </NavLink>

              <NavLink
                to="/inseminaciones"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                Inseminaciones
              </NavLink>

              <NavLink to="/partos" className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }>
                Partos
              </NavLink>

              <NavLink to="/segcamada" className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }>
                Seguimiento de Camada
              </NavLink>

              <NavLink to="/seguimiento_cerda" className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }>
                Seguimiento de Cerda
              </NavLink>

            </div >

          )
          }

        </div >


        {/* Sanidad */}

        < div >

          <div
            className={buttonClass}
            onClick={() => setSanidadOpen(!sanidadOpen)}
          >
            💊 Sanidad
            <span>{sanidadOpen ? "▼" : "▶"}</span>
          </div>

          {
            sanidadOpen && (

              <div className="ml-4 flex flex-col gap-1">

                <NavLink
                  to="/medicamentos"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ""}`
                  }
                >
                  Medicamentos
                </NavLink>

              </div>

            )
          }

        </div >


        {/* Administración */}
        {usuario?.cargo === "instructor" && (
          <div>

            <div
              className={buttonClass}
              onClick={() => setAdminOpen(!adminOpen)}
            >
              👨‍🌾 Administración
              <span>{adminOpen ? "▼" : "▶"}</span>
            </div>

            {adminOpen && (
              <div className="ml-4 flex flex-col gap-1">

                <NavLink
                  to="/responsables"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ""}`
                  }
                >
                  Responsables
                </NavLink>

              </div>
            )}

          </div>
        )}

      </nav >

    </aside >
  )
}