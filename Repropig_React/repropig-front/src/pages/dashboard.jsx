import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import apiAxios from "../api/axiosConfig"

const Dashboard = () => {

  const { usuario } = useAuth()
  console.log("Usuario completo:", usuario)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    porcinos: 0,
    colectas: 0,
    montas: 0,
    inseminaciones: 0,
    reproducciones: 0
  })

  const [ultimasReproducciones, setUltimasReproducciones] = useState([])

  const hora = new Date().getHours()
  const saludo =
    hora < 12 ? "Buenos días" :
    hora < 18 ? "Buenas tardes" :
    "Buenas noches"

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {

      const [porcinos, colectas, montas, inseminaciones, reproducciones] =
        await Promise.all([
          apiAxios.get("/porcino"),
          apiAxios.get("/colectas"),
          apiAxios.get("/monta"),
          apiAxios.get("/inseminacion"),
          apiAxios.get("/reproducciones/")
        ])

      setStats({
        porcinos: porcinos.data.length,
        colectas: colectas.data.length,
        montas: montas.data.length,
        inseminaciones: inseminaciones.data.length,
        reproducciones: reproducciones.data.length
      })

      const ultimas = [...reproducciones.data].reverse().slice(0, 5)
      setUltimasReproducciones(ultimas)

    } catch (error) {
      console.error("Error cargando datos del dashboard:", error)
    }
  }

  const todosLosModulos = [
  { nombre: "Porcinos", icono: "🐖", ruta: "/porcinos", desc: "Gestiona tu plantel" },
  { nombre: "Razas", icono: "🧬", ruta: "/razas", desc: "Información genética" },
  { nombre: "Reproducciones", icono: "🔄", ruta: "/reproducciones", desc: "Control reproductivo" },
  { nombre: "Montas", icono: "🐷", ruta: "/montas", desc: "Monta natural" },
  { nombre: "Inseminaciones", icono: "💉", ruta: "/inseminaciones", desc: "Inseminación artificial" },
  { nombre: "Colectas", icono: "🧪", ruta: "/colectas", desc: "Material genético" },
  { nombre: "Medicamentos", icono: "💊", ruta: "/medicamentos", desc: "Control sanitario" },
  { nombre: "Responsables", icono: "👥", ruta: "/responsables", desc: "Equipo de trabajo", soloRoles: ['instructor'] }
]

const modulos = todosLosModulos.filter(m =>
  !m.soloRoles || m.soloRoles.includes(usuario?.cargo?.toLowerCase())
)
  const statCards = [
    { label: "Porcinos", valor: stats.porcinos, icono: "🐖", ruta: "/porcinos" },
    { label: "Reproducciones", valor: stats.reproducciones, icono: "🔄", ruta: "/reproducciones" },
    { label: "Colectas", valor: stats.colectas, icono: "🧪", ruta: "/colectas" },
    { label: "Inseminaciones", valor: stats.inseminaciones, icono: "💉", ruta: "/inseminaciones" }
  ]

  return (

    <div className="min-h-screen bg-[#FFF8F9] p-6">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Bienvenida */}

        <div className="relative overflow-hidden rounded-2xl p-10 text-white bg-gradient-to-r from-[#E8A0A8] to-[#C97A85] shadow-lg">

          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[90px] opacity-20">
            🐖
          </div>

          <p className="opacity-90 text-lg">{saludo},</p>

          <h1 className="text-3xl font-bold mt-1">
            {usuario?.nombres} {usuario?.apellidos} 👋
          </h1>

          <p className="opacity-90 mt-2">
            Bienvenido al sistema de gestión reproductiva porcina
          </p>

          <span className="inline-block mt-4 bg-white/20 px-4 py-1 rounded-full text-sm">
            {usuario?.cargo}
          </span>

        </div>

        {/* Estadísticas */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {statCards.map(s => (

            <div
              key={s.label}
              onClick={() => navigate(s.ruta)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300 border border-gray-100"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-gray-500 text-sm">
                    {s.label}
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-1">
                    {s.valor}
                  </h2>

                </div>

                <div className="text-3xl bg-pink-50 p-3 rounded-xl">
                  {s.icono}
                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Grid inferior */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Acceso rápido */}

          <div className="bg-white rounded-xl p-6 shadow-sm">

            <h3 className="font-bold text-[#C97A85] mb-4">
              🚀 Acceso rápido
            </h3>

            <div className="grid grid-cols-2 gap-4">

              {modulos.map(m => (

                <div
                  key={m.nombre}
                  onClick={() => navigate(m.ruta)}
                  className="cursor-pointer border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >

                  <span className="text-2xl">
                    {m.icono}
                  </span>

                  <div>

                    <div className="text-sm font-semibold text-gray-800">
                      {m.nombre}
                    </div>

                    <div className="text-xs text-gray-500">
                      {m.desc}
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Últimas reproducciones */}

          <div className="bg-white rounded-xl p-6 shadow-sm">

            <h3 className="font-bold text-[#C97A85] mb-4">
              🕐 Últimas reproducciones
            </h3>

            {ultimasReproducciones.length === 0 ? (

              <p className="text-gray-400 text-center py-10">
                No hay reproducciones registradas
              </p>

            ) : (

              <div className="space-y-3">

                {ultimasReproducciones.map(r => (

                  <div
                    key={r.Id_Reproduccion}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      r.TipoReproduccion === "Monta"
                        ? "bg-pink-50"
                        : "bg-blue-50"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-xl">
                        {r.TipoReproduccion === "Monta" ? "🐷" : "💉"}
                      </span>

                      <div>

                        <div className="font-semibold text-sm">
                          {r.porcino?.Nom_Porcino || `Porcino #${r.Id_Cerda}`}
                        </div>

                        <div className="text-xs text-gray-500">
                          {r.TipoReproduccion}
                        </div>

                      </div>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        r.Activo === "S"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {r.Activo === "S" ? "Activa" : "Inactiva"}
                    </span>

                  </div>

                ))}

              </div>

            )}

            <button
              onClick={() => navigate("/reproducciones")}
              className="mt-4 w-full bg-gradient-to-r from-[#E8A0A8] to-[#C97A85] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Ver todas las reproducciones →
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard