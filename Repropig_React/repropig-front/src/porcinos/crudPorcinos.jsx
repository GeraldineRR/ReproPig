import { useState, useEffect } from "react"
import apiAxios from "../axios/axiosConfig.js"
import DataTable from 'react-data-table-component'
import PorcinoForm from "./porcinoForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const CrudPorcinos = () => {

    const [porcinos, setPorcinos] = useState([])

    const calcularEdadActual = (fechaNacimiento) => {
        if (!fechaNacimiento) return 0

        const nacimiento = new Date(fechaNacimiento)
        const hoy = new Date()

        if (hoy < nacimiento) return 0

        let años = hoy.getFullYear() - nacimiento.getFullYear()
        let meses = hoy.getMonth() - nacimiento.getMonth()

        if (meses < 0) {
            años--
            meses += 12
        }

        return años * 12 + meses
    }

    const [porcinoEdit, setPorcinoEdit] = useState(null)
    const [filterText, setFilterText] = useState('')

    const columnsTable = [
    { name: 'Nombre', selector: row => row.Nom_Porcino, },
    { name: 'Chapeta', selector: row => row.Num_Chapeta, },
    { name: 'Placa Sena', selector: row => row.Plac_Sena_Porcino, },
    { name: 'Raza', selector: row => row.razas.Nom_Raza, sortable: false,},
    { name: 'Sexo', selector: row => { const sexo = row.Gen_Porcino?.trim().toLowerCase()
    if ( sexo === 'm') {
      return ( <span className="fw-normal"> <i className="fa-solid fa-mars text-primary me-1"></i> Macho </span> ) }

    if ( sexo === 'h') {
      return ( <span className="fw-normal"> <i className="fa-solid fa-venus text-danger me-1"></i> Hembra </span> ) }
    return 'N/A'}},

    { name: 'Procedencia', selector: row => ( <span className={`badge rounded-pill px-2 py-1 ${ row.Proc_Porcino?.trim().toLowerCase() === 'interno' ? 'bg-success' : 'bg-primary' }`} > {row.Proc_Porcino} </span> ), },
    { name: 'Lugar Proc.', selector: row => row.Lug_Proc_Porcino, },
    { name: 'Fecha Nac.', selector: row => row.Fec_Nac_Porcino, },
    { name: 'Fecha Lleg', selector: row => row.Fec_Llegada, },
    { name: 'Peso Lleg (kg)', selector: row => {
        const peso = row.Peso_Llegada
        if (!peso) return 'No aplica'
            let clase = ''
            let icono = ''
                if (peso < 1) {
                clase = 'bg-danger'
                icono = '⚠'
                } else if (peso < 2) {
                clase = 'bg-danger-subtle text-danger'
                icono = '!'
                } else {
                clase = 'bg-success'
                icono = '✓'
                }
    return (
      <span className={`badge ${clase} px-2 py-1`}> {icono} {peso} kg </span> ) } },

    { name: 'Edad Llegada', selector: row => row.Edad_Llegada !== null && row.Edad_Llegada !== undefined ? `${row.Edad_Llegada} ${row.Edad_Llegada === 1 ? "mes" : "meses"}` : 'N/A', },
    { name: 'Edad Actual', selector: row => { const edad = calcularEdadActual(row.Fec_Nac_Porcino)
        return `${edad} meses`}, },
    { name: 'Acciones', cell: row => (
        <button className="btn btn-sm bg-info" onClick={() => handleEdit(row)}><i className="fa-solid fa-pencil"></i></button>
        )
    }
]

    useEffect(() => {

        getAllPorcinos()

    }, [])

    const getAllPorcinos = async () => {
        const response = await apiAxios.get('/api/porcino/')
        setPorcinos(response.data)
        console.log(response.data)
    }

    const newListPorcinos = porcinos.filter(porcino => {

        const textToSearch = filterText.toLowerCase()

        const chapeta = porcino.Num_Chapeta.toString().toLowerCase()
        const nombre = porcino.Nom_Porcino.toLowerCase()
        const placa = porcino.Plac_Sena_Porcino.toString().toLowerCase()
        const procedencia = porcino.Proc_Porcino.toLowerCase()
        const sexoBase = porcino.Gen_Porcino.trim().toLowerCase()
        let sexo = ''
            if (sexoBase === 'm') sexo = 'macho'
            else if (sexoBase === 'h') sexo = 'hembra'
            else sexo = sexoBase

        return (
            chapeta.includes(textToSearch) ||
            nombre.includes(textToSearch) ||
            placa.includes(textToSearch) ||
            procedencia.includes(textToSearch) ||
            sexo.includes(textToSearch)
        )
    })

    const hideModal = () => {
        setPorcinoEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (porcino) => {
        setPorcinoEdit(porcino)

        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    return (
        <>

            <div className="container mt-5">

                <div className="row d-flex mb-3 justify-content-between"> 
                <div className="col-4">
                <input className="form-control" value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="🔍 Buscar un nombre, chapeta, placa o procedencia..." />
                </div>

                <div className="col-2">
                    <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setPorcinoEdit(null)}>
                        + Registrar porcino
                    </button>
                </div>
                </div>

                <DataTable
                    title="Porcinos"
                    columns={columnsTable}
                    data={newListPorcinos}
                    keyField="Id_Porcino"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                />


                    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">{porcinoEdit ? "Editar Porcino" : "Agregar Porcino"}</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal"></button>
                                </div>
                                <div className="modal-body">
                                    <PorcinoForm key={porcinoEdit ? porcinoEdit.Id_Porcino : 'new'} hideModal={hideModal} porcinoEdit={porcinoEdit} reload={getAllPorcinos}/>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CrudPorcinos