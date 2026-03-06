import { Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import RutaProtegida from "./components/layout/RutaProtegida"

// Landing y Auth
import Landing from "./pages/landing"
import Login from "./pages/Login"
import Home from "./home/home"

// Módulos David
import CrudColecta from "./Modulos/colectas/crudColecta"
import CrudMonta from "./Modulos/montas/crudMonta"
import CrudInseminacion from "./Modulos/inseminaciones/crudInseminacion"

// Módulos Andry
import CrudMedicamentos from "./Modulos/Medicamentos/crudMedicamentos"
import CrudReproducciones from "./Modulos/Reproducciones/crudReproducciones"

// Módulo JuanFe
import CrudResponsables from "./Modulos/Responsables/crudresponsables.jsx"

function App() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '70px' }}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/* Rutas protegidas */}
          <Route path="/home" element={<RutaProtegida><Home /></RutaProtegida>} />
          <Route path="/colectas" element={<RutaProtegida><CrudColecta /></RutaProtegida>} />
          <Route path="/montas" element={<RutaProtegida><CrudMonta /></RutaProtegida>} />
          <Route path="/inseminaciones" element={<RutaProtegida><CrudInseminacion /></RutaProtegida>} />
          <Route path="/medicamentos" element={<RutaProtegida><CrudMedicamentos /></RutaProtegida>} />
          <Route path="/reproducciones" element={<RutaProtegida><CrudReproducciones /></RutaProtegida>} />
          <Route path="/responsables" element={<RutaProtegida><CrudResponsables /></RutaProtegida>} />
        </Routes>
      </div>
    </>
  )
}

export default App