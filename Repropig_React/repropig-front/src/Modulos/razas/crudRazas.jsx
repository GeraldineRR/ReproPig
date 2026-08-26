import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import RazaForm from "./razaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from 'sweetalert2'
import WithReactContent from 'sweetalert2-react-content'

const CrudRazas = () => {

    const [razas, setRazas] = useState([])
    const [loadingId, setLoadingId] = useState(null);
    const [razaEdit, setRazaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')

    const MySwal = WithReactContent(Swal)

    // Función para alternar el estado de la raza con confirmación SweetAlert
    const toggleEstado = async (row) => {
        const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
        const accion = esActivo ? 'inactivar' : 'activar';

        const result = await MySwal.fire({
            title: `¿Deseas ${accion} esta raza?`,
            text: `La raza ${row.Nom_Raza} pasará a estar ${esActivo ? 'Inactiva' : 'Activa'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoadingId(row.Id_Raza);
            try {
                const res = await apiAxios.put(`/raza/${row.Id_Raza}/toggle-estado`);
                MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                setRazas(prev =>
                    prev.map(p =>
                        p.Id_Raza === row.Id_Raza
                            ? { ...p, Estado: res.data.Estado }
                            : p
                    )
                );
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado de la raza.' });
            } finally {
                setLoadingId(null);
            }
        }
    };

    const columnsTable = [
        {
            name: 'Id Raza',
            selector: row => row.Id_Raza,
            sortable: true
        },
        {
            name: 'Nombre de la Raza',
            selector: row => row.Nom_Raza,
            sortable: true
        },
        {
            name: 'Estado',
            cell: row => {
                const esActivo = row.Estado === 'Activo' || row.Estado === 'A' || !row.Estado;
                return (
                    <button
                        className={`badge border-0 ${esActivo ? 'bg-success' : 'bg-danger'}`}
                        onClick={() => toggleEstado(row)}
                        disabled={loadingId === row.Id_Raza}
                        style={{ cursor: 'pointer' }}
                    >
                        {loadingId === row.Id_Raza ? '...' : (esActivo ? 'Activo' : 'Inactivo')}
                    </button>
                );
            }
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="d-flex gap-1">
                    <button
                        className="btn btn-sm bg-info"
                        onClick={() => handleEdit(row)}
                        title="Editar"
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button
                        className={`btn btn-sm ${row.Estado === 'Inactivo' || row.Estado === 'I' ? 'btn-success' : 'btn-warning'}`}
                        title={row.Estado === 'Inactivo' || row.Estado === 'I' ? 'Activar' : 'Inactivar'}
                        onClick={() => toggleEstado(row)}
                        disabled={loadingId === row.Id_Raza}
                    >
                        <i className={`fa-solid ${row.Estado === 'Inactivo' || row.Estado === 'I' ? 'fa-check' : 'fa-ban'}`}></i>
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        getAllRazas()
    }, [])

    const getAllRazas = async () => {
        const response = await apiAxios.get('/raza/')
        setRazas(response.data)
    }

    const newListRazas = razas.filter(raza => {
        return raza.Nom_Raza.toLowerCase()
            .includes(filterText.toLowerCase())
    })

    const hideModal = () => {
        setRazaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (raza) => {
        setRazaEdit(raza)

        const modal = new bootstrap.Modal(
            document.getElementById('exampleModal')
        )
        modal.show()
    }

    return (
        <>
            <div className="container mt-5" style={{ maxWidth: "10000px" }}>

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <div className="d-flex gap-2">
                        <div className="input-group">
                            <span className="input-group-text">
                                🔍
                            </span>
                            <input
                                className="form-control"
                                style={{ width: '290px' }}
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Buscar raza..."
                            />
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-success"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => setRazaEdit(null)}
                        >
                            + Nueva Raza
                        </button>
                    </div>
                </div>


                <div className="card-body px-9">
                    <DataTable
                        title="Razas"
                        columns={columnsTable}
                        data={newListRazas}
                        keyField="Id_Raza"
                        pagination
                        highlightOnHover
                        pointerOnHover
                        striped
                    />

                </div>

                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h1 className="modal-title fs-5">
                                    {razaEdit
                                        ? "Editar Raza"
                                        : "Agregar Raza"}
                                </h1>

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <RazaForm
                                    key={razaEdit
                                        ? razaEdit.Id_Raza
                                        : 'new'
                                    }
                                    hideModal={hideModal}
                                    razaEdit={razaEdit}
                                    reload={getAllRazas}
                                />
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudRazas