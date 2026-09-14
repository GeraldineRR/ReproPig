import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import apiAxios from "../api/axiosConfig"
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { 
  TbPig, TbDna, TbRefresh, TbHeart, TbVaccine, TbFlask, TbPill, TbUsers, 
  TbRocket, TbClock, TbInbox, TbChevronRight
} from 'react-icons/tb'

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
    ciclos: 0
  })
  
  const [chartData, setChartData] = useState({
      activos: 0,
      inactivos: 0,
      hembras: 0,
      machos: 0
  });

  const [ultimasCiclos, setUltimasCiclos] = useState([])
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
      const [porcinos, colectas, montas, inseminaciones, ciclos] =
        await Promise.all([
          apiAxios.get("/porcino").catch(() => ({ data: [] })),
          apiAxios.get("/colectas").catch(() => ({ data: [] })),
          apiAxios.get("/monta").catch(() => ({ data: [] })),
          apiAxios.get("/inseminacion").catch(() => ({ data: [] })),
          apiAxios.get("/ciclos/").catch(() => ({ data: [] }))
        ])

      setStats({
        porcinos: porcinos.data.length,
        colectas: colectas.data.length,
        montas: montas.data.length,
        inseminaciones: inseminaciones.data.length,
        ciclos: ciclos.data.length
      })
      
      const hembrasCount = porcinos.data.filter(p => p.Gen_Porcino?.toLowerCase() === 'h').length;
      const machosCount = porcinos.data.filter(p => p.Gen_Porcino?.toLowerCase() === 'm').length;
      
      const ciclosActivos = ciclos.data.filter(c => (c.Estado || '').toLowerCase() === 'activo' || c.Activo === 'S').length;
      const ciclosInactivos = ciclos.data.filter(c => (c.Estado || '').toLowerCase() === 'inactivo' || c.Activo === 'N').length;
      
      setChartData({
          activos: ciclosActivos,
          inactivos: ciclosInactivos,
          hembras: hembrasCount,
          machos: machosCount
      });

      const ultimas = [...ciclos.data].reverse().slice(0, 5)
      setUltimasCiclos(ultimas)
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const todosLosModulos = [
    { nombre: "Porcinos", icono: <TbPig size={24} strokeWidth={1.5} />, ruta: "/porcinos", desc: "Gestiona tu plantel" },
    { nombre: "Razas", icono: <TbDna size={24} strokeWidth={1.5} />, ruta: "/razas", desc: "Información genética" },
    { nombre: "Ciclos", icono: <TbRefresh size={24} strokeWidth={1.5} />, ruta: "/ciclos", desc: "Control reproductivo" },
    { nombre: "Montas", icono: <TbHeart size={24} strokeWidth={1.5} />, ruta: "/montas", desc: "Monta natural" },
    { nombre: "Inseminaciones", icono: <TbVaccine size={24} strokeWidth={1.5} />, ruta: "/inseminaciones", desc: "Inseminación artificial" },
    { nombre: "Colectas", icono: <TbFlask size={24} strokeWidth={1.5} />, ruta: "/colectas", desc: "Material genético" },
    { nombre: "Medicamentos", icono: <TbPill size={24} strokeWidth={1.5} />, ruta: "/medicamentos", desc: "Control sanitario" },
    { nombre: "Responsables", icono: <TbUsers size={24} strokeWidth={1.5} />, ruta: "/responsables", desc: "Equipo de trabajo", soloRoles: ['instructor'] }
  ]

  const modulos = todosLosModulos.filter(m =>
    !m.soloRoles || m.soloRoles.includes(usuario?.cargo?.toLowerCase())
  )

  const statCards = [
    { label: "Total Porcinos", valor: stats.porcinos, icono: <TbPig size={28} strokeWidth={1.5} />, bg: "bg-gradient-to-br from-pink-50 to-pink-100", iconBg: "bg-pink-200", text: "text-pink-600", ruta: "/porcinos" },
    { label: "Ciclos Registrados", valor: stats.ciclos, icono: <TbRefresh size={28} strokeWidth={1.5} />, bg: "bg-gradient-to-br from-blue-50 to-blue-100", iconBg: "bg-blue-200", text: "text-blue-600", ruta: "/ciclos" },
    { label: "Colectas Registradas", valor: stats.colectas, icono: <TbFlask size={28} strokeWidth={1.5} />, bg: "bg-gradient-to-br from-amber-50 to-amber-100", iconBg: "bg-amber-200", text: "text-amber-600", ruta: "/colectas" },
    { label: "Inseminaciones", valor: stats.inseminaciones, icono: <TbVaccine size={28} strokeWidth={1.5} />, bg: "bg-gradient-to-br from-teal-50 to-teal-100", iconBg: "bg-teal-200", text: "text-teal-600", ruta: "/inseminaciones" }
  ]

  const currentDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  // Componente Tooltip personalizado para Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="font-bold text-gray-700">{data.name}</p>
          <p className="text-sm font-bold flex items-center gap-2 mt-1" style={{ color: data.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
            Cantidad: {data.cantidad}
          </p>
        </div>
      );
    }
    return null;
  };

  // Renderización de Gráfico con Recharts
  const renderChart = () => {
    if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">Cargando gráficos...</div>;
    
    const dataPoblacion = [
      { name: 'Hembras', cantidad: chartData.hembras, color: '#ec4899' }, // pink-500
      { name: 'Machos', cantidad: chartData.machos, color: '#3b82f6' }    // blue-500
    ];

    const dataCiclos = [
      { name: 'Activos', cantidad: chartData.activos, color: '#10b981' },   // emerald-500
      { name: 'Inactivos', cantidad: chartData.inactivos, color: '#94a3b8' } // slate-400
    ];

    return (
      <div className="flex flex-col md:flex-row gap-8 mt-4">
        {/* Gráfico 1: Población */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          <h4 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider text-center relative z-10">Población (Hembras vs Machos)</h4>
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPoblacion} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {dataPoblacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Ciclos */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          <h4 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider text-center relative z-10">Estado de Ciclos</h4>
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCiclos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {dataCiclos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Modern Premium Welcome Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl bg-gradient-to-br from-[#B86B77] via-[#C97A85] to-[#DDA3AA] border border-white/40 group">
          {/* Animated Mesh Gradients */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-orange-300/40 to-pink-300/40 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000 ease-in-out"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-purple-400/30 to-blue-300/30 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000 ease-in-out"></div>
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* Left Content */}
            <div className="space-y-5 md:w-3/5">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-semibold tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-white/30 transition-colors cursor-default">
                <CalendarIcon />
                <span className="capitalize text-white/95">{currentDate}</span>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 text-white drop-shadow-md">
                  {saludo}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-100 to-white">{usuario?.nombres?.split(' ')[0] || 'Usuario'}</span> 👋
                </h1>
                <p className="text-lg md:text-xl text-white/90 font-medium max-w-xl leading-relaxed drop-shadow-sm">
                  Bienvenido al sistema inteligente de gestión reproductiva porcina. 
                  Aquí tienes el resumen de hoy.
                </p>
              </div>

              <div className="pt-3">
                <span className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm text-[#B86B77] px-6 py-2.5 rounded-2xl text-sm font-black shadow-xl hover:shadow-2xl hover:bg-white hover:-translate-y-0.5 transition-all duration-300">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  Rol: {(usuario?.cargo || 'Gestor').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Right Interactive Art */}
            <div className="hidden lg:block relative w-72 h-72 mr-8">
              {/* Floating Card 1 (Top Right) */}
              <div className="absolute top-0 -right-8 w-44 h-24 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] p-4 transform rotate-6 hover:rotate-0 hover:scale-110 hover:bg-white/20 transition-all duration-500 z-20 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-pink-500 rounded-xl flex items-center justify-center shadow-lg border border-pink-200/50">
                    <span className="text-2xl">🧬</span>
                  </div>
                  <div>
                    <div className="text-[11px] text-white/80 font-bold uppercase tracking-wider">Genética</div>
                    <div className="text-sm text-white font-black">Optimizada</div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 (Bottom Left) */}
              <div className="absolute bottom-4 -left-8 w-48 h-28 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_12px_40px_0_rgba(0,0,0,0.2)] p-4 transform -rotate-6 hover:rotate-0 hover:scale-110 hover:bg-white/30 transition-all duration-500 z-20 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg border border-emerald-200/50">
                    <span className="text-3xl">📈</span>
                  </div>
                  <div>
                    <div className="text-[11px] text-white/90 font-bold uppercase tracking-wider">Eficiencia</div>
                    <div className="text-2xl text-white font-black">98%</div>
                  </div>
                </div>
              </div>

              {/* Center 3D Pig Composition */}
              <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-700">
                {/* Spinning halo */}
                <div className="absolute w-56 h-56 rounded-full border-[2px] border-dashed border-white/40 animate-[spin_15s_linear_infinite]"></div>
                <div className="absolute w-48 h-48 rounded-full border-[1px] border-white/30 animate-[spin_10s_linear_infinite_reverse]"></div>
                
                {/* Center glow */}
                <div className="absolute w-40 h-40 bg-white/30 rounded-full blur-2xl animate-pulse"></div>
                
                {/* The 3D Rendered Pig */}
                <div className="relative z-30 w-40 h-40 rounded-full overflow-hidden border-4 border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-white flex items-center justify-center transform hover:rotate-6 transition-all cursor-pointer">
                  <img 
                    src="/pig-3d.jpg" 
                    alt="Mascota Repropig" 
                    className="w-full h-full object-cover transform scale-110"
                  />
                </div>
              </div>
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

        {/* --- NUEVA SECCIÓN DE GRÁFICOS (ANALÍTICA) --- */}
        <div>
          <div className="flex items-center gap-3 mb-4 pl-2">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">Gráficas de Análisis</h3>
              <p className="text-sm text-gray-500 font-medium">Comparativa de población y ciclos reproductivos</p>
            </div>
          </div>
          
          {renderChart()}
          
        </div>

        {/* Bottom Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 mt-4">
          
          {/* Quick Access Area (Takes up 7 cols on large screens) */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Módulos Rápidos</h3>
                <p className="text-sm text-gray-500 mt-1">Accede a las funciones principales del sistema</p>
              </div>
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
                <TbRocket size={24} strokeWidth={1.5} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {modulos.map((m, idx) => (
                <div
                  key={m.nombre}
                  onClick={() => navigate(m.ruta)}
                  className="group relative cursor-pointer border border-gray-100 rounded-2xl p-4 flex items-center gap-4 bg-white hover:bg-gray-50/50 hover:border-pink-200 transition-all duration-300"
                >
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-600 transition-colors duration-300 z-10">
                    {m.icono}
                  </div>
                  <div className="flex-1 z-10">
                    <div className="text-base font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                      {m.nombre}
                    </div>
                    <div className="text-xs font-medium text-gray-400 line-clamp-1 mt-0.5">
                      {m.desc}
                    </div>
                  </div>
                  <div className="text-gray-200 group-hover:text-pink-400 group-hover:translate-x-1 transition-all z-10">
                    <TbChevronRight size={20} strokeWidth={2} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Activity (Takes up 5 cols on large screens) */}
          <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Actividad Reciente</h3>
                <p className="text-sm text-gray-500 mt-1">Últimos ciclos registrados</p>
              </div>
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
                <TbClock size={24} strokeWidth={1.5} />
              </div>
            </div>

            <div className="flex-1 flex flex-col relative z-10">
              {isLoading ? (
                <div className="space-y-4 flex-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-gray-50 rounded-2xl bg-gray-50/50 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : ultimasCiclos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/80 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                  <TbInbox size={48} strokeWidth={1} className="mb-2 opacity-50" />
                  <p className="text-gray-500 font-medium text-sm mt-2">No hay ciclos recientes</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {ultimasCiclos.map(r => {
                    const isMonta = r.TipoCiclo === "Monta";
                    const isActivo = (r.Estado || '').toLowerCase() === "activo" || r.Activo === "S";
                    return (
                      <div
                        key={r.Id_Ciclo}
                        className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-gray-50 hover:border-gray-100 transition-all duration-200 cursor-pointer"
                        onClick={() => navigate("/ciclos")}
                      >
                        <div className="flex items-center gap-4 pl-1">
                          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
                            {isMonta ? <TbHeart size={20} strokeWidth={1.5} /> : <TbVaccine size={20} strokeWidth={1.5} />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
                              {r.porcino?.Nom_Porcino || `Porcino #${r.Id_Cerda}`}
                            </div>
                            <div className="text-xs font-medium text-gray-400 mt-0.5">
                              {r.TipoCiclo}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wide shadow-sm border ${
                            isActivo
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-gray-100 text-gray-500 border-gray-200"
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
              onClick={() => navigate("/ciclos")}
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