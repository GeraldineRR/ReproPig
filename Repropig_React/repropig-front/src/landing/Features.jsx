import { Link } from "react-router-dom"

const isLoggedIn = true

function Features() {

  const modulos = [
    { nombre: "Inseminación", ruta: "/inseminaciones", icon: "💉", color: "#FFE4EC", accent: "#E8A0B0", desc: "Gestión profesional del módulo de inseminación con control y trazabilidad completa.", activo: true },
    { nombre: "Colecta", ruta: "/colectas", icon: "🧪", color: "#E4F0FF", accent: "#A0B8E8", desc: "Gestión profesional del módulo de colecta con control y trazabilidad completa.", activo: true },
    { nombre: "Monta", ruta: "/montas", icon: "🐷", color: "#FFE8E0", accent: "#E8B0A0", desc: "Gestión profesional del módulo de monta con control y trazabilidad completa.", activo: true },
    { nombre: "Medicamentos", ruta: "/medicamentos", icon: "💊", color: "#E8F4E4", accent: "#A0C8A0", desc: "Gestión profesional del módulo de medicamentos con control y trazabilidad completa.", activo: true },
    { nombre: "Reproducciones", ruta: "/reproducciones", icon: "🔬", color: "#FFF4E0", accent: "#E8C880", desc: "Gestión profesional del módulo de reproducciones con control y trazabilidad completa.", activo: true },
    { nombre: "Responsables", ruta: "/responsables", icon: "👤", color: "#F0F4FF", accent: "#A0B0E8", desc: "Gestión de responsables y roles del sistema porcícola.", activo: true },
    { nombre: "Porcinos", ruta: "/porcinos", icon: "🐖", color: "#F4F0FF", accent: "#C0A0E8", desc: "Registro y seguimiento completo de los porcinos de la granja.", activo: true },
    { nombre: "Razas", ruta: "/razas", icon: "🧬", color: "#F4F0FF", accent: "#C0A0E8", desc: "Registro de las razas de porcinos.", activo: true },
    { nombre: "Partos", ruta: "/partos", icon: "🍼", color: "#FFF0F4", accent: "#E8A0B8", desc: "Control detallado de partos, camadas y registro de nacimientos.", activo: true },
    { nombre: "Historial", ruta: null, icon: "📋", color: "#F4F4F0", accent: "#B0B8A0", desc: "Historial completo de eventos y registros del sistema.", activo: false },
  ]

  return (
    <section id="modulos" className="py-[100px] px-8 bg-[#FFFAF8] font-sans">

      <div className="max-w-[1100px] mx-auto">

        <div className="text-center text-[0.72rem] font-bold tracking-[2.5px] uppercase text-[#C97A85] mb-[10px]">
          Plataforma
        </div>

        <h2 className="text-center font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-bold text-[#3D2E30] mb-[10px]">
          Módulos del Sistema
        </h2>

        <p className="text-center text-[#9A7080] text-[0.92rem] font-light max-w-[460px] mx-auto mb-[52px] leading-[1.7]">
          Cada módulo está diseñado para una gestión precisa, con trazabilidad y control total del proceso reproductivo.
        </p>


        {isLoggedIn ? (

          <div className="grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">

            {modulos.map((mod, i) =>
              mod.activo ? (

                <div
                  key={i}
                  style={{ "--card-bg": mod.color, "--card-accent": mod.accent }}
                  className="group relative overflow-hidden rounded-[20px] border-[1.5px] border-[#F0DCE0] bg-white pt-[30px] pb-[26px] px-[26px] transition-all duration-300 hover:-translate-y-[8px] hover:rotate-x-[4deg] hover:-rotate-y-[2deg] hover:shadow-[0_20px_50px_rgba(180,80,110,0.14)] hover:border-[var(--card-accent)]"
                >

                  <div
                    className="w-[56px] h-[56px] rounded-[16px] flex items-center justify-center text-[1.6rem] mb-[20px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-transform duration-300 group-hover:scale-[1.08] group-hover:-translate-y-[4px]"
                    style={{ background: mod.color }}
                  >
                    {mod.icon}
                  </div>

                  <div className="font-serif text-[1.08rem] font-bold text-[#3D2E30] mb-[8px]">
                    {mod.nombre}
                  </div>

                  <div className="text-[0.83rem] text-[#9A7080] leading-[1.65] font-light">
                    {mod.desc}
                  </div>

                </div>

              ) : (

                <div
                  key={i}
                  className="relative rounded-[20px] border-[1.5px] border-dashed border-[#E8D8DC] bg-[#FAFAFA] pt-[30px] pb-[26px] px-[26px] opacity-70 cursor-not-allowed"
                >

                  <span className="absolute top-[16px] right-[16px] bg-gradient-to-br from-[#F0DCE0] to-[#E8C8CC] text-[#B07080] text-[0.65rem] font-bold px-[10px] py-[3px] rounded-full uppercase">
                    Próximamente
                  </span>

                  <div
                    className="w-[56px] h-[56px] rounded-[16px] flex items-center justify-center text-[1.6rem] mb-[20px]"
                    style={{ background: mod.color }}
                  >
                    {mod.icon}
                  </div>

                  <div className="font-serif text-[1.08rem] font-bold text-[#9A8088] mb-[8px]">
                    {mod.nombre}
                  </div>

                  <div className="text-[0.83rem] text-[#9A7080] leading-[1.65] font-light">
                    {mod.desc}
                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="text-center p-[56px_24px] bg-white border-[1.5px] border-dashed border-[#F0DCE0] rounded-[24px] max-w-[480px] mx-auto">

            <div className="text-[3rem] mb-[16px]">🔒</div>

            <div className="font-serif text-[1.4rem] text-[#3D2E30] mb-[10px] font-bold">
              Acceso exclusivo
            </div>

            <p className="text-[0.9rem] text-[#9A7080] mb-[28px] leading-[1.65]">
              Los módulos del sistema están disponibles solo para usuarios registrados.
              Inicia sesión o crea tu cuenta para acceder.
            </p>

            <div className="flex gap-[12px] justify-center flex-wrap">

              <Link
                to="/login"
                className="bg-gradient-to-br from-[#E8A0A8] to-[#C97A85] text-white no-underline py-[12px] px-[28px] rounded-[10px] font-semibold text-[0.88rem] shadow-[0_4px_16px_rgba(201,122,133,0.3)] hover:-translate-y-[2px] transition"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="bg-transparent text-[#C97A85] py-[11px] px-[26px] rounded-[10px] font-semibold text-[0.88rem] border-[1.5px] border-[#E8A0A8] hover:bg-[#FDE8EC] transition"
              >
                Registrarse
              </Link>

            </div>

          </div>

        )}

      </div>
    </section>
  )
}

export default Features