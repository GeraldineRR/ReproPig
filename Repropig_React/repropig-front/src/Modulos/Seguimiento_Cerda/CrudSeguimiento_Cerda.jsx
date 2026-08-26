import apiAxios from "../../api/axiosConfig.js"
import { useState, useEffect } from "react"
import DataTable from 'react-data-table-component'
import Seguimiento_CerdaForm from "./Seguimiento_CerdaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from 'sweetalert2'
import WithReactContent from 'sweetalert2-react-content'


const crudSeguimiento_Cerda = () => {
    const [Seguimiento_Cerda, setSeguimiento_Cerda] = useState([])
    const [Seguimiento_CerdaEdit, setSeguimiento_CerdaEdit] = useState(null)
    const [filterText, setFilterText] = useState("")
    const [modalKey, setModalKey] = useState(0)  // ← AGREGADO

    const MySwal = WithReactContent(Swal)

    const toggleEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
        const accion = esActivo ? 'inactivar' : 'activar';

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} este seguimiento de cerda?`,
            text: `El seguimiento #${row.Id_Seguimiento_Cerda} pasará a estar ${esActivo ? 'Inactivo' : 'Activo'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.put(`/Seguimiento_Cerda/${row.Id_Seguimiento_Cerda}/toggle-estado`);
                MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                getAllSeguimiento_Cerda();
            } catch (error) {
                try {
                    const nuevoEstado = esActivo ? 'Inactivo' : 'Activo';
                    await apiAxios.put(`/Seguimiento_Cerda/${row.Id_Seguimiento_Cerda}`, { ...row, Estado: nuevoEstado });
                    MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                    getAllSeguimiento_Cerda();
                } catch (err) {
                    MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.' });
                }
            }
        }
    };

    const columnsTable = [
        { name: 'Id', selector: row => row.Id_Seguimiento_Cerda, width: '70px' },
        { name: 'Fecha', selector: row => row.Fecha },
        { name: 'Hora', selector: row => row.Hora },
        { name: 'Cerda', selector: row => row.porcino?.Nom_Porcino || row.Id_Porcino },
        { name: 'Id Ciclo', selector: row => row.Id_Ciclo || '—' },
        { name: 'Responsable', selector: row => row.Responsables?.Nombres || '—' },
        { name: 'Medicamento', selector: row => row.medicamentos?.Nombre || '—' },
        { name: 'Observaciones', selector: row => row.Observaciones, wrap: true },
        {
            name: 'Estado',
            cell: row => {
                const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
                return (
                    <button
                        className={`badge border-0 ${esActivo ? 'bg-success' : 'bg-danger'}`}
                        onClick={() => toggleEstado(row)}
                        style={{ cursor: 'pointer' }}
                    >
                        {esActivo ? 'Activo' : 'Inactivo'}
                    </button>
                );
            }
        },
        {
            name: 'Acciones', cell: row => (
                <div className="d-flex gap-1">
                    <button className="btn btn-sm bg-info" onClick={() => handleEdit(row)} title="Editar">
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button className={`btn btn-sm ${row.Estado === 'Inactivo' || row.Estado === 'I' ? 'btn-success' : 'btn-warning'}`}
                        onClick={() => toggleEstado(row)}
                        title={row.Estado === 'Inactivo' || row.Estado === 'I' ? 'Activar' : 'Inactivar'}>
                        <i className={`fa-solid ${row.Estado === 'Inactivo' || row.Estado === 'I' ? 'fa-check' : 'fa-ban'}`}></i>
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        getAllSeguimiento_Cerda()
    }, [])

    const getAllSeguimiento_Cerda = async () => {
        const response = await apiAxios.get('/Seguimiento_Cerda')
        setSeguimiento_Cerda(response.data)
    }

    const newListSeguimiento_Cerda = Seguimiento_Cerda.filter(Seguimiento_Cerda => {
        const textToSearch = filterText.toLowerCase()
        const Id = String(Seguimiento_Cerda?.Id_Seguimiento_Cerda || '').toLowerCase()
        const Fecha = String(Seguimiento_Cerda?.Fecha || '').toLowerCase()
        return (
            Id.includes(textToSearch) ||
            Fecha.includes(textToSearch)
        )
    })

    const hideModal = () => {
        setSeguimiento_CerdaEdit(null)
        setModalKey(prev => prev + 1)  // ← fuerza formulario vacío
        document.getElementById('closeModal').click()
    }

    const handleEdit = (Seguimiento_Cerda) => {
        setSeguimiento_CerdaEdit(Seguimiento_Cerda)
        setModalKey(prev => prev + 1)  // ← fuerza re-render con datos
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const handleNuevo = () => {
        setSeguimiento_CerdaEdit(null)
        setModalKey(prev => prev + 1)  // ← fuerza formulario vacío
        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
            modal.show()
        }, 0)
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex mb-3 justify-content-between">
                    <div className="col-4">
                        <input className="form-control" value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="🔍 Buscar...." />
                    </div>
                    <div className="col-2">
                        <button type="button" className="btn btn-primary" onClick={handleNuevo}>
                            Nuevo
                        </button>
                    </div>
                </div>

                <DataTable
                    title="Seguimiento Cerda"
                    columns={columnsTable}
                    data={newListSeguimiento_Cerda}
                    keyField="Id_Seguimiento_Cerda"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                />

                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">
                                    {Seguimiento_CerdaEdit ? "Editar Seguimiento_Cerda" : "Agregar Seguimiento_Cerda"}
                                </h1>
                                <button id="closeModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <Seguimiento_CerdaForm
                                    key={modalKey}
                                    hideModal={hideModal}
                                    Seguimiento_CerdaEdit={Seguimiento_CerdaEdit}
                                    reload={getAllSeguimiento_Cerda}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default crudSeguimiento_Cerda