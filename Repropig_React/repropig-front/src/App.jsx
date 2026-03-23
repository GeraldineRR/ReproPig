import { Routes, Route } from 'react-router-dom'
import NavBar from './navBar.jsx'
import CrudSeguimiento_Cerda from './Modulos/Seguimiento_Cerda/CrudSeguimiento_Cerda.jsx'


function App() {

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<div className="container mt-5"><h1>Pagina Principal</h1></div>} />
        <Route path="/Seguimiento_Cerda" element={<CrudSeguimiento_Cerda />} />
        
      </Routes>
    </div>
  )
}

export default App