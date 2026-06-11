import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import CriaForm from "./CriaForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const CrudCrias = () => {

    const [crias, setCrias] = useState([])
    const [criaEdit, setCriaEdit] = useState(null)
    const [filterText, setFilterText] = useState('')
    const { id: partoIdParams } = useParams()
    const navigate = useNavigate()

    const columnsTable = [

        { name: 'N° Cría', selector: row => "N° " + row.Num_Cria },

        {
            name: 'Sexo',
            cell: row => (
                <select
                    className="form-select form-select-sm"
                    value={row.Sexo?.trim().toUpperCase()}
                    onChange={(e) => updateCriaField(row.Id_Cria, 'Sexo', e.target.value)}
                >
                    <option value="">—</option>
                    <option value="M">Macho</option>
                    <option value="H">Hembra</option>
                </select>
            ),
            sortable: true
        },

        {
            name: 'Estado',
            selector: row => (
                <span className={`badge ${row.Estado === 'Vivo' ? 'bg-success' : 'bg-danger'
                    }`}>
                    {row.Estado}
                </span>
            )
        },

        {
            name: 'Fecha Muerte',
            selector: row => row.Fecha_Muerte ? row.Fecha_Muerte.split('T')[0].split('-').reverse().join('/') : '—',
            sortable: true
        },

        {
            name: 'Causa Muerte',
            cell: row => (
                <input
                    type="text"
                    className="form-control form-control-sm"
                    defaultValue={row.Causa_Muerte || ''}
                    placeholder="—"
                    onBlur={(e) => {
                        if (e.target.value !== (row.Causa_Muerte || '')) {
                            updateCriaField(row.Id_Cria, 'Causa_Muerte', e.target.value)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateCriaField(row.Id_Cria, 'Causa_Muerte', e.target.value)
                            e.target.blur()
                        }
                    }}
                    disabled={row.Estado !== 'Muerto'}
                />
            )
        },

        // {
        //     name: 'Acciones',
        //     cell: row => (
        //         <button
        //             className="btn btn-sm bg-info"
        //             onClick={() => handleEdit(row)}
        //         >
        //             <i className="fa-solid fa-pencil"></i>
        //         </button>
        //     )
        // }
    ]

    useEffect(() => {
        getAllCrias()
    }, [])

    const getAllCrias = async () => {
        try {
            const response = await apiAxios.get('/cria/')
            setCrias(response.data)
        } catch (error) {
            console.error("Error cargando crías:", error)
        }
    }

    const updateCriaField = async (id, field, value) => {
        try {
            let data = { [field]: value };

            if (field === 'Estado' && value === 'Muerto') {
                data.Fecha_Muerte = new Date().toISOString().split('T')[0];
            } else if (field === 'Estado' && value === 'Vivo') {
                data.Fecha_Muerte = null;
                data.Causa_Muerte = null;
            }

            await apiAxios.put(`/cria/${id}`, data);

            // Update local state for better UX without full reload if possible, 
            // but getAllCrias is safer for complex logic
            getAllCrias();

            MySwal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Actualizado',
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error("Error updating field:", error);
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el campo'
            });
        }
    }

    const newListCrias = crias.filter(cria => {

        const text = filterText.toLowerCase()

        const estado = cria.Estado?.toLowerCase() || ''

        const sexoBase = cria.Sexo?.trim().toLowerCase()
        let sexo = ''
        if (sexoBase === 'm') sexo = 'macho'
        else if (sexoBase === 'h') sexo = 'hembra'

        const fechaMuerte = cria.Fecha_Muerte ? cria.Fecha_Muerte.split('T')[0] : ''

        const numCria = cria.Num_Cria?.toString() || ''

        const causaMuerte = cria.Causa_Muerte?.toLowerCase() || ''

        const matchesText = estado.includes(text) || sexo.includes(text) || numCria.includes(text) || causaMuerte.includes(text) || fechaMuerte.includes(text)

        if (partoIdParams) {
            return cria.Id_parto?.toString() === partoIdParams && matchesText
        }

        return matchesText
    })

    const hideModal = () => {
        setCriaEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (cria) => {
        setCriaEdit(cria)

        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const porcinoInfo = newListCrias[0]?.partos
    return (
        <>
            <div className="container mt-4">

                <div className="row d-flex mb-3 justify-content-between">

                    <div className="col-md-5 d-flex gap-2 align-items-center">

                        {partoIdParams && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/partos')}
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                            </button>
                        )}

                        <div style={{ maxWidth: '320px', width: '100%' }}>
                            <div className="input-group">
                                <span className="input-group-text">🔍</span>
                                <input
                                    className="form-control"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    placeholder="Buscar..."
                                />
                            </div>
                        </div>

                    </div>
                    {/* DERECHA */}
                    {porcinoInfo && (
                        <div className="col-md-4 mt-3 mt-md-0">

                            <div
                                className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm"
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #eee'
                                }}
                            >

                                {/* IZQUIERDA - CHIP INFO */}
                                <div className="d-flex align-items-center gap-3">

                                    <span
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: '#e8f5e9',
                                            color: '#2e7d32',
                                            fontSize: '18px'
                                        }}
                                    >
                                        🐖
                                    </span>

                                    <div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#9e9e9e',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            Madre del parto actual
                                        </div>

                                        <div
                                            className="fw-semibold"
                                            style={{ fontSize: '18px', color: '#212529' }}
                                        >
                                            {porcinoInfo.porcino?.Nom_Porcino}
                                        </div>
                                    </div>

                                </div>

                                {/* DERECHA - CHIP PARTO */}
                                <div
                                    className="px-3 py-2"
                                    style={{
                                        background: '#f1f3f5',
                                        borderRadius: '999px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: '#495057'
                                    }}
                                >
                                    Parto #{porcinoInfo.Id_parto}
                                </div>

                            </div>

                        </div>
                    )}

                </div>

                <DataTable
                    title="Crías"
                    columns={columnsTable}
                    data={newListCrias}
                    keyField="Id_Cria"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                />

                <div className="modal fade" id="exampleModal" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title"> {criaEdit ? "Editar Cría" : "Agregar Cría"} </h5>

                                <button
                                    type="button" className="btn-close" data-bs-dismiss="modal" id="closeModal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <CriaForm key={criaEdit ? criaEdit.Id_Cria : 'new'} hideModal={hideModal} criaEdit={criaEdit} reload={getAllCrias}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div >
        </>
    )
}

export default CrudCrias