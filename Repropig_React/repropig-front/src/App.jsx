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

      </Routes>
    </>
  )
}

export default App