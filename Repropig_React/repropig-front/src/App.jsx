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
import Login from "./pages/Login";

function App() {
  return (
    <Routes>

      {/* Landing SIN Navbar */}
      <Route path="/" element={<Landing />} />

      {/* Todas las demás rutas CON Navbar */}
      <Route
        path="/*"
        element={
          <>
            <NavBar />
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="colectas" element={<CrudColecta />} />
              <Route path="montas" element={<CrudMonta />} />
              <Route path="inseminaciones" element={<CrudInseminacion />} />
              <Route path="medicamentos" element={<CrudMedicamentos />} />
              <Route path="reproducciones" element={<CrudReproducciones />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </>
        }
      />

    </Routes>
  )
}

export default App