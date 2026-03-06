import { Routes, Route } from "react-router-dom" 
import Navbar from "./components/layout/Navbar"

// Landing
import Landing from "./pages/landing"
import Home from "./home/home"

// Geral
import CrudPorcinos from "./porcinos/crudPorcinos.jsx"
import CrudRazas from "./razas/crudRazas.jsx"

// Módulos David
import CrudColecta from "./Modulos/colectas/crudColecta"
import CrudMonta from "./Modulos/montas/crudMonta"
import CrudInseminacion from "./Modulos/inseminaciones/crudInseminacion"

// Módulos Andry
import CrudMedicamentos from "./Modulos/Medicamentos/crudMedicamentos"
import CrudReproducciones from "./Modulos/Reproducciones/crudReproducciones"

// Módulo JuanFe
import CrudResponsables from "./Responsables/crudresponsables.jsx"

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/porcino" element={<CrudPorcinos />} />
        <Route path="/raza" element={<CrudRazas />} />
        <Route path="/colectas" element={<CrudColecta />} />
        <Route path="/montas" element={<CrudMonta />} />
        <Route path="/inseminaciones" element={<CrudInseminacion />} />
        <Route path="/medicamentos" element={<CrudMedicamentos />} />
        <Route path="/reproducciones" element={<CrudReproducciones />} />

        {/* Ruta nueva */}
        <Route path="/responsables" element={<CrudResponsables />} />
      </Routes>
    </>
  )
}

export default App
