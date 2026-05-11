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
import CrudCalendario from "./Modulos/Calendario/crudCalendario"
import CrudCrias from "./Modulos/crias/crudCrias"
import CrudSegcamada from "./Modulos/segcamada/crudCamada"
import CrudSeguimiento_Cerda from "./Modulos/Seguimiento_Cerda/crudSeguimiento_Cerda"
import PerfilCerda from "./pages/PerfilCerda"
import MiPerfil from "./pages/MiPerfil"

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
        <Route path="/crias/parto/:id" element={<CrudCrias />} />
        <Route path="/segcamada" element={<CrudSegcamada />} />
        <Route path="/segcamada/parto/:id" element={<CrudSegcamada />} />
        <Route path="/Seguimiento_Cerda" element={<CrudSeguimiento_Cerda />} />
        <Route path="/Calendario" element={<CrudCalendario />} />
        <Route path="/perfil-cerda/:id" element={<PerfilCerda />} />
        <Route path="/mi-perfil" element={<MiPerfil />} />
      

      </Route>

    </Routes>

  )
}

export default App