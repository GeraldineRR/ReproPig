import { useState } from 'react'

import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import CrudMedicamentos from './Medicamentos/crudMedicamentos'
import CrudReproducciones from './Reproducciones/crudReproducciones'
import NavBar from './navBar'
import Home from './home/home'


function App() {


  return (
    <>
    <NavBar/>
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/Medicamentos' element={<CrudMedicamentos/>}></Route>
      <Route path='/Reproducciones' element={<CrudReproducciones/>}></Route>
    </Routes>
      
    </>
  )
}

export default App