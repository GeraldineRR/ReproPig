import { Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar" // el navbar inteligente

// Landing
import Landing from "./pages/landing"
import Home from "./home/home"

// Módulos David
import CrudColecta from "./Modulos/colectas/crudColecta"
import CrudMonta from "./Modulos/montas/crudMonta"
import CrudInseminacion from "./Modulos/inseminaciones/crudInseminacion"

// Módulos Andry
import CrudMedicamentos from "./Modulos/Medicamentos/crudMedicamentos"
import CrudReproducciones from "./Modulos/Reproducciones/crudReproducciones"

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/colectas" element={<CrudColecta />} />
        <Route path="/montas" element={<CrudMonta />} />
        <Route path="/inseminaciones" element={<CrudInseminacion />} />
        <Route path="/medicamentos" element={<CrudMedicamentos />} />
        <Route path="/reproducciones" element={<CrudReproducciones />} />
      </Routes>
    </>
  )
}

export default App