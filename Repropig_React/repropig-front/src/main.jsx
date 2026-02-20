import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'


import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

//import CrudMedicamentos from './Medicamentos/crudMedicamentos.jsx'
//import MedicamentosForm from './Medicamentos/MedicamentosForm.jsx'
//import CrudReproducciones from './Reproducciones/crudReproducciones.jsx'

import { BrowserRouter } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/**Envolver con BrowserRouter el punto de entrada de la app para que las rutas funcionen */}
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>,
)