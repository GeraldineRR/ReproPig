import { useState } from 'react'

import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './home/home.jsx' 
import CrudPorcinos from './porcinos/crudPorcinos.jsx'
import NavBar from './navBar.jsx'
import CrudRazas from './razas/crudRazas.jsx'

function App() {
  
  return (
    <>
    <NavBar/>
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/porcino" element={<CrudPorcinos />}></Route>
      <Route path='/raza' element={<CrudRazas />}></Route>
    </Routes>
    </>
  )
}

export default App
