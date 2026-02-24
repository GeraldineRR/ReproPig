import { Routes, Route } from "react-router-dom"

// Landing
import Landing from "./pages/landing"

// Módulos
import CrudColecta from "./Modulos/colectas/crudColecta"
import CrudMonta from "./Modulos/montas/crudMonta"
import CrudInseminacion from "./Modulos/inseminaciones/crudInseminacion"

// (Opcional futuro)
// import Login from "./pages/Login"
// import Register from "./pages/Register"

function App() {
  return (
    <Routes>

      {/* Landing principal */}
      <Route path="/" element={<Landing />} />

      {/* Módulos */}
      <Route path="/colectas" element={<CrudColecta />} />
      <Route path="/montas" element={<CrudMonta />} />
      <Route path="/inseminaciones" element={<CrudInseminacion />} />

    </Routes>
  )
}

export default App