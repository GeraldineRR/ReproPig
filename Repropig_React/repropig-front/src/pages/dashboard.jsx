import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import apiAxios from "../api/axiosConfig"

// --- Custom SVGs for better aesthetics ---
const TrendUpIcon = () => (
  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Dashboard = () => {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    porcinos: 0,
    colectas: 0,
    montas: 0,
    inseminaciones: 0,
    reproducciones: 0
  })

  const [ultimasReproducciones, setUltimasReproducciones] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const hora = new Date().getHours()
  const saludo =
    hora < 12 ? "Buenos días" :
    hora < 18 ? "Buenas tardes" :
    "Buenas noches"

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setIsLoading(true)
    try {
      const [porcinos, colectas, montas, inseminaciones, reproducciones] =
        await Promise.all([
          apiAxios.get("/porcino").catch(() => ({ data: [] })),
          apiAxios.get("/colectas").catch(() => ({ data: [] })),
          apiAxios.get("/monta").catch(() => ({ data: [] })),
          apiAxios.get("/inseminacion").catch(() => ({ data: [] })),
          apiAxios.get("/reproducciones/").catch(() => ({ data: [] }))
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
    } finally {
      setIsLoading(false)
    }
  }

  const todosLosModulos = [
    { nombre: "Porcinos", icono: "🐖", color: "bg-pink-100 text-pink-600", ruta: "/porcinos", desc: "Gestiona tu plantel" },
    { nombre: "Razas", icono: "🧬", color: "bg-purple-100 text-purple-600", ruta: "/razas", desc: "Información genética" },
    { nombre: "Reproducciones", icono: "🔄", color: "bg-blue-100 text-blue-600", ruta: "/reproducciones", desc: "Control reproductivo" },
    { nombre: "Montas", icono: "🐷", color: "bg-rose-100 text-rose-600", ruta: "/montas", desc: "Monta natural" },
    { nombre: "Inseminaciones", icono: "💉", color: "bg-teal-100 text-teal-600", ruta: "/inseminaciones", desc: "Inseminación artificial" },
    { nombre: "Colectas", icono: "🧪", color: "bg-amber-100 text-amber-600", ruta: "/colectas", desc: "Material genético" },
    { nombre: "Medicamentos", icono: "💊", color: "bg-red-100 text-red-600", ruta: "/medicamentos", desc: "Control sanitario" },
    { nombre: "Responsables", icono: "👥", color: "bg-indigo-100 text-indigo-600", ruta: "/responsables", desc: "Equipo de trabajo", soloRoles: ['instructor'] }
  ]

  const modulos = todosLosModulos.filter(m =>
    !m.soloRoles || m.soloRoles.includes(usuario?.cargo?.toLowerCase())
  )

  const statCards = [
    { label: "Total Porcinos", valor: stats.porcinos, icono: "🐖", bg: "bg-gradient-to-br from-pink-50 to-pink-100", iconBg: "bg-pink-200", text: "text-pink-600", ruta: "/porcinos" },
    { label: "Reproducciones", valor: stats.reproducciones, icono: "🔄", bg: "bg-gradient-to-br from-blue-50 to-blue-100", iconBg: "bg-blue-200", text: "text-blue-600", ruta: "/reproducciones" },
    { label: "Colectas Activas", valor: stats.colectas, icono: "🧪", bg: "bg-gradient-to-br from-amber-50 to-amber-100", iconBg: "bg-amber-200", text: "text-amber-600", ruta: "/colectas" },
    { label: "Inseminaciones", valor: stats.inseminaciones, icono: "💉", bg: "bg-gradient-to-br from-teal-50 to-teal-100", iconBg: "bg-teal-200", text: "text-teal-600", ruta: "/inseminaciones" }
  ]

  const currentDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Modern Welcome Banner */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 text-white shadow-2xl bg-[#C97A85] border border-white/20">
          {/* Glassmorphism abstract blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-gradient-to-b from-white/20 to-transparent rotate-12 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-[50%] -left-[10%] w-[60%] h-[150%] bg-gradient-to-t from-black/10 to-transparent -rotate-12 blur-3xl rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wide shadow-sm">
                <CalendarIcon />
                <span className="capitalize">{currentDate}</span>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-sm">
                  {saludo}, <span className="text-pink-100">{usuario?.nombres?.split(' ')[0] || 'Usuario'}</span> 👋
                </h1>
                <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl leading-relaxed">
                  Bienvenido al sistema inteligente de gestión reproductiva porcina. 
                  Aquí tienes el resumen de hoy.
                </p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 bg-white text-[#C97A85] px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Rol: {usuario?.cargo || 'Gestor'}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-inner">
              <span className="text-[120px] filter drop-shadow-2xl hover:scale-110 transition-transform duration-500 cursor-default">
                🐖
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s, idx) => (
            <div
              key={s.label}
              onClick={() => navigate(s.ruta)}
              className={`relative overflow-hidden ${s.bg} rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 cursor-pointer transition-all duration-300 border border-white group`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Decorative top-right circle */}
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${s.iconBg} opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${s.iconBg} ${s.text} shadow-inner group-hover:rotate-12 transition-transform duration-300`}>
                    <span className="text-3xl">{s.icono}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 shadow-sm">
                    <TrendUpIcon />
                    <span>Activos</span>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-4xl font-black text-gray-800 tracking-tight mb-1">
                    {isLoading ? (
                      <div className="h-10 w-16 bg-gray-200/60 animate-pulse rounded-lg"></div>
                    ) : (
                      s.valor
                    )}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Quick Access Area (Takes up 7 cols on large screens) */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Módulos Rápidos</h3>
                <p className="text-sm text-gray-500 mt-1">Accede a las funciones principales del sistema</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-2xl">
                <span className="text-2xl">🚀</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modulos.map((m, idx) => (
                <div
                  key={m.nombre}
                  onClick={() => navigate(m.ruta)}
                  className="group cursor-pointer border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-pink-200 hover:bg-pink-50/50 hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl ${m.color} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{m.icono}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-800 group-hover:text-[#C97A85] transition-colors">
                      {m.nombre}
                    </div>
                    <div className="text-xs font-medium text-gray-500 line-clamp-1 mt-0.5">
                      {m.desc}
                    </div>
                  </div>
                  <div className="text-gray-300 group-hover:text-[#C97A85] group-hover:translate-x-1 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Activity (Takes up 5 cols on large screens) */}
          <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Actividad Reciente</h3>
                <p className="text-sm text-gray-500 mt-1">Últimas reproducciones</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl">
                <span className="text-2xl">🕐</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {isLoading ? (
                <div className="space-y-4 flex-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-gray-50 rounded-2xl bg-gray-50/50 animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : ultimasReproducciones.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <span className="text-5xl mb-4 grayscale opacity-50">📭</span>
                  <p className="text-gray-500 font-medium">No hay reproducciones<br/>registradas aún</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {ultimasReproducciones.map(r => {
                    const isMonta = r.TipoReproduccion === "Monta";
                    return (
                      <div
                        key={r.Id_Reproduccion}
                        className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all duration-300 bg-white cursor-pointer"
                        onClick={() => navigate("/reproducciones")}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-inner ${isMonta ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                            <span className="text-2xl">{isMonta ? "🐷" : "💉"}</span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm group-hover:text-[#C97A85] transition-colors">
                              {r.porcino?.Nom_Porcino || `Porcino #${r.Id_Cerda}`}
                            </div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">
                              {r.TipoReproduccion}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                            r.Activo === "S"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-rose-100 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {r.Activo === "S" ? "ACTIVA" : "INACTIVA"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/reproducciones")}
              className="mt-6 w-full relative overflow-hidden group bg-gray-50 hover:bg-[#C97A85] text-gray-700 hover:text-white py-4 rounded-2xl font-bold transition-all duration-300 border border-gray-200 hover:border-transparent shadow-sm hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Ver historial completo
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </div>

        </div>
      </div>
      
      {/* Simple global styles for animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}} />
    </div>
  )
}

export default Dashboard