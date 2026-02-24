import { Routes, Route } from "react-router-dom"

// Layout
import NavBar from "./navBar"

// Landing
import Landing from "./pages/landing"
import Home from "./home/home"

// Módulos David
import CrudColecta from "./Modulos/colectas/crudColecta"
import CrudMonta from "./Modulos/montas/crudMonta"
import CrudInseminacion from "./Modulos/inseminaciones/crudInseminacion"

// Módulos Andry
import CrudMedicamentos from "./Medicamentos/crudMedicamentos"
import CrudReproducciones from "./Reproducciones/crudReproducciones"

// Modulos Alejandra
import CrudSeguimiento_Cerda from "./Modulos/Seguimiento_Cerda/CrudSeguimiento_Cerda"

function App() {
  return (
    <>
      <NavBar />
      <Routes>

        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Módulos David */}
        <Route path="/colectas" element={<CrudColecta />} />
        <Route path="/montas" element={<CrudMonta />} />
        <Route path="/inseminaciones" element={<CrudInseminacion />} />

        {/* Módulos Andry */}
        <Route path="/medicamentos" element={<CrudMedicamentos />} />
        <Route path="/reproducciones" element={<CrudReproducciones />} />

        {/* Módulos Alejandra */}
        <Route path="/seguimiento_cerda" element={<CrudSeguimiento_Cerda />} />

      </Routes>
    </>
  )
}

export default App