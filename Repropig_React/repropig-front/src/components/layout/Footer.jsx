function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        
        <h3 className="text-xl font-bold text-white">
          Repropig
        </h3>

        <p className="mt-3 text-sm">
          Sistema Integral de Gestión Reproductiva Porcina
        </p>

        <p className="mt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} Repropig. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer