import { useState } from 'react'

import { Routes, Route, Navigate } from 'react-router-dom';
import CrudResponsables from './Responsables/crudresponsables.jsx';

function App() {
  return (
    <Routes>
      
      {/* Redirige la raíz a /responsables */}
      <Route path="/" element={<Navigate to="/responsables" />} />

      <Route path="/responsables" element={<CrudResponsables />} />

    </Routes>
  )
}

export default App