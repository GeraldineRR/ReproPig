import { Link } from "react-router-dom"

function Features() {
  const modulos = [
    { nombre: "Inseminación", ruta: "/inseminaciones" },
    { nombre: "Colecta", ruta: "/colectas" },
    { nombre: "Monta", ruta: "/montas" },
    { nombre: "Reportes", ruta: "/reportes" },
    { nombre: "Historial", ruta: "/historial" },
    { nombre: "Control Reproductivo", ruta: "/control" },
  ]

  return (
    <section id="modulos" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800">
          Módulos del Sistema
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {modulos.map((modulo, index) => (
            <Link key={index} to={modulo.ruta}>
              <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition duration-300 cursor-pointer">

                <h3 className="text-xl font-bold text-rose-600">
                  {modulo.nombre}
                </h3>

                <p className="mt-3 text-slate-600">
                  Gestión profesional del módulo de {modulo.nombre.toLowerCase()} con
                  control y trazabilidad completa.
                </p>

              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features