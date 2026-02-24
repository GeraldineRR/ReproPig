function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-r from-rose-100 to-white">
      <div className="max-w-6xl mx-auto px-6 text-center">

        <h1 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight">
          Sistema Integral de Gestión
          <br />
          <span className="text-rose-600">
            Reproductiva Porcina
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Control eficiente de gestión reproductiva de porcinos 
          en un solo sistema moderno y profesional.
        </p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <a
            href="#modulos"
            className="bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-md hover:bg-rose-700 transition"
          >
            Ver Módulos
          </a>

          <a
            href="/login"
            className="border border-rose-600 text-rose-600 px-6 py-3 rounded-2xl hover:bg-rose-50 transition"
          >
            Comenzar
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero