import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Ajustar estado inicial según ancho de pantalla (desktop abierto, móvil cerrado)
  useEffect(() => {
    try {
      setSidebarOpen(window.innerWidth >= 768)
    } catch (e) {
      // no-op en entornos sin window
    }
  }, [])

  return (
    <div className="h-screen flex flex-col">

      <Navbar 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />

      <div className="flex flex-1 overflow-hidden relative">

        <Sidebar isOpen={sidebarOpen} />

        {/* Overlay móvil cuando el sidebar está abierto */}
        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  )
}