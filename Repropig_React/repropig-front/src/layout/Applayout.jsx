import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"

export default function AppLayout() {

  return (

    <div className="h-screen flex flex-col">

      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">

        {/* Sidebar */}
        <Sidebar />

        {/* Contenido */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>

  )
}