import { Routes, Route } from "react-router-dom"

import AppLayout from "./layout/applayout"
import RutaProtegida from "./components/RutaProtegida"

// páginas
import Landing from "./pages/landing"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

// módulos
import CrudPorcinos from "./Modulos/porcinos/crudPorcinos"
import CrudRazas from "./Modulos/razas/crudRazas"
import CrudColecta from "./Modulos/colectas/crudColecta"
import CrudMonta from "./Modulos/montas/crudMonta"
import CrudInseminacion from "./Modulos/inseminaciones/crudInseminacion"
import CrudMedicamentos from "./Modulos/Medicamentos/crudMedicamentos"
import CrudReproducciones from "./Modulos/Reproducciones/crudReproducciones"
import CrudResponsables from "./Modulos/Responsables/crudresponsables"
import CrudPartos from "./Modulos/Partos/crudPartos"
import CrudCrias from "./Modulos/Crias/crudCrias"
import CrudSegcamada from "./Modulos/segcamada/crudCamada"
import CrudSeguimiento_Cerda from "./Modulos/Seguimiento_Cerda/crudSeguimiento_Cerda"

function App() {

  return (

    <Routes>

      {/* públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* protegidas */}
      <Route element={<RutaProtegida><AppLayout /></RutaProtegida>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/porcinos" element={<CrudPorcinos />} />
        <Route path="/razas" element={<CrudRazas />} />
        <Route path="/colectas" element={<CrudColecta />} />
        <Route path="/montas" element={<CrudMonta />} />
        <Route path="/inseminaciones" element={<CrudInseminacion />} />
        <Route path="/medicamentos" element={<CrudMedicamentos />} />
        <Route path="/reproducciones" element={<CrudReproducciones />} />
        <Route
          path="/responsables"
          element={
            <RutaProtegida rolesPermitidos={["instructor"]}>
              <CrudResponsables />
            </RutaProtegida>
          }
        />
        <Route path="/partos" element={<CrudPartos />} />
        <Route path="/crias" element={<CrudCrias />} />
        <Route path="/segcamada" element={<CrudSegcamada />} />
        <Route path="/Seguimiento_Cerda" element={<CrudSeguimiento_Cerda />} />

      </Route>

    </Routes>

  )
}

export default App