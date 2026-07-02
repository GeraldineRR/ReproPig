import { Routes, Route, Navigate } from "react-router-dom"

import AppLayout from "./layout/Applayout"
import RutaProtegida from "./components/RutaProtegida"

// páginas
import Landing from "./pages/landing"
import Login from "./pages/Login"
import Dashboard from "./pages/dashboard"

// módulos
import CrudPorcinos from "./Modulos/porcinos/crudPorcinos"
import CrudRazas from "./Modulos/razas/crudRazas"
import CrudColecta from "./Modulos/colectas/crudColecta"
import CrudMonta from "./Modulos/montas/crudMonta"
import CrudInseminacion from "./Modulos/inseminaciones/crudInseminacion"
import CrudMedicamentos from "./Modulos/Medicamentos/crudMedicamentos"
import CrudCiclos from "./Modulos/Ciclos/crudCiclos"
import CrudResponsables from "./Modulos/Responsables/crudresponsables"
import CrudPartos from "./Modulos/Partos/crudPartos"
import CrudCalendario from "./Modulos/Calendario/CrudCalendario"
import CrudCrias from "./Modulos/crias/crudCrias"

import CrudSeguimiento_Cerda from "./Modulos/Seguimiento_Cerda/CrudSeguimiento_Cerda"
import PerfilCerda from "./pages/PerfilCerda"
import MiPerfil from "./pages/MiPerfil"
import CrudNovedades from "./Modulos/Novedades/CrudNovedades"
import CrudActividadesCamada from "./Modulos/ActividadesCamada/CrudActividadesCamada"

function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* protegidas */}
      <Route element={<RutaProtegida />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/porcinos" element={<CrudPorcinos />} />
          <Route path="/razas" element={<CrudRazas />} />
          <Route path="/colectas" element={<CrudColecta />} />
          <Route path="/montas" element={<CrudMonta />} />
          <Route path="/inseminaciones" element={<CrudInseminacion />} />
          <Route path="/medicamentos" element={<CrudMedicamentos />} />
          <Route path="/ciclos" element={<CrudCiclos />} />
          <Route path="/partos" element={<CrudPartos />} />
          <Route path="/crias" element={<CrudCrias />} />
          <Route path="/crias/parto/:id" element={<CrudCrias />} />
          <Route path="/actividades_camada/parto/:id" element={<CrudActividadesCamada />} />
          <Route path="/seguimiento_cerda" element={<CrudSeguimiento_Cerda />} />
          <Route path="/calendario" element={<CrudCalendario />} />
          <Route path="/perfil-cerda/:id" element={<PerfilCerda />} />
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/novedades" element={<CrudNovedades />} />
          <Route path="/actividades_camada" element={<CrudActividadesCamada />} />

          <Route element={<RutaProtegida rolesPermitidos={["instructor"]} />}>
            <Route path="/responsables" element={<CrudResponsables />} />
          </Route>
        </Route>
      </Route>

      {/* compatibilidad con rutas antiguas */}
      <Route path="/Seguimiento_Cerda" element={<Navigate to="/seguimiento_cerda" replace />} />
      <Route path="/Calendario" element={<Navigate to="/calendario" replace />} />
    </Routes>
  )
}

export default App
