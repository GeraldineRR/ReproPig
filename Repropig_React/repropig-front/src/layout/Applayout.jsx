import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Ajustar estado inicial según ancho de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 768) {
          setSidebarOpen(true)
        } else {
          setSidebarOpen(false)
        }
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">

      <Navbar 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(prev => !prev)} 
      />

      <div className="flex flex-1 overflow-hidden relative">

        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />

        {/* Overlay móvil cuando el sidebar está abierto */}
        <div 
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`} 
          onClick={() => setSidebarOpen(false)} 
        />

        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto max-w-full w-full">
          <Outlet />
        </main>

      </div>

    </div>
  )
}
