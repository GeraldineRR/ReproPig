import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const SubActividades = ({ segCamada }) => {
    const MySwal = withReactContent(Swal)
    const [actividades, setActividades] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [responsables, setResponsables] = useState([])

    const [tipoSelect, setTipoSelect] = useState('')
    const [otraActividad, setOtraActividad] = useState('')
    const [fechaActividad, setFechaActividad] = useState(segCamada?.Fecha_Real?.split('T')[0] || new Date().toISOString().split('T')[0])
    const [observaciones, setObservaciones] = useState('')
    const [selectedMedicamentos, setSelectedMedicamentos] = useState([])
    const [selectedResponsables, setSelectedResponsables] = useState([])

    useEffect(() => {
        if (segCamada) {
            getActividades()
            getMedicamentos()
            getResponsables()
            setFechaActividad(segCamada?.Fecha_Real?.split('T')[0] || new Date().toISOString().split('T')[0])
        }
    }, [segCamada])

    const getActividades = async () => {
        try {
            const res = await apiAxios.get('/actividades_camada/')
            const filtradas = res.data.filter(a => Number(a.Id_SegCamada) === Number(segCamada.Id_SegCamada))
            setActividades(filtradas)
        } catch (error) {
            console.error("Error al obtener actividades:", error)
        }
    }

    const getMedicamentos = async () => {
        try {
            const res = await apiAxios.get('/medicamentos/')
            setMedicamentos(res.data)
        } catch (error) {
            console.error("Error al obtener medicamentos:", error)
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(res.data)
        } catch (error) {
            console.error("Error al obtener responsables:", error)
        }
    }

    const parsearIDs = (valor) => {
        if (!valor) return []
        if (Array.isArray(valor)) return valor.map(Number)
        if (typeof valor === 'string' && valor.startsWith('[')) {
            try { return JSON.parse(valor).map(Number) } catch { return [] }
        }
        const num = Number(valor)
        return isNaN(num) ? [] : [num]
    }

    const getNombresMedicamentos = (val) => {
        const ids = parsearIDs(val)
        if (ids.length === 0) return 'N/A'
        const nombres = ids.map(id => {
            const m = medicamentos.find(med => Number(med.Id_Medicamento) === Number(id))
            return m ? m.Nombre : `#${id}`
        })
        return nombres.join(', ')
    }

    const getNombresResponsables = (val) => {
        const ids = parsearIDs(val)
        if (ids.length === 0) return 'N/A'
        const nombres = ids.map(id => {
            const r = responsables.find(resp => Number(resp.Id_Responsable) === Number(id))
            return r ? `${r.Nombres} ${r.Apellidos || ''}`.trim() : `#${id}`
        })
        return nombres.join(', ')
    }

    const toggleMedicamento = (id) => {
        const numId = Number(id)
        setSelectedMedicamentos(prev =>
            prev.includes(numId) ? prev.filter(item => item !== numId) : [...prev, numId]
        )
    }

    const toggleResponsable = (id) => {
        const numId = Number(id)
        setSelectedResponsables(prev =>
            prev.includes(numId) ? prev.filter(item => item !== numId) : [...prev, numId]
        )
    }

    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await apiAxios.delete(`/actividades_camada/${id}`)
                MySwal.fire('Eliminada!', 'La actividad ha sido eliminada.', 'success')
                getActividades()
            } catch (error) {
                MySwal.fire('Error', 'No se pudo eliminar', 'error')
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let tipoFinal = tipoSelect
        if (tipoSelect === 'Otro') {
            if (!otraActividad.trim()) {
                MySwal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Por favor escriba la actividad en el campo "Otro".' })
                return
            }
            tipoFinal = otraActividad.trim()
        }

        const payload = {
            Tipo_Actividad: tipoFinal,
            Fecha_Actividad: fechaActividad,
            Observaciones: observaciones,
            Id_SegCamada: segCamada.Id_SegCamada,
            Id_Medicamento: selectedMedicamentos.length > 0 ? JSON.stringify(selectedMedicamentos) : null,
            Id_Responsable: selectedResponsables.length > 0 ? JSON.stringify(selectedResponsables) : null
        }

        try {
            await apiAxios.post('/actividades_camada/', payload)
            MySwal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false })
            setTipoSelect('')
            setOtraActividad('')
            setSelectedMedicamentos([])
            setSelectedResponsables([])
            setObservaciones('')
            getActividades()
        } catch (error) {
            console.error("Error guardando actividad:", error)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || error.message || 'No se pudo guardar la actividad.'
            })
        }
    }

    const columns = [
        {
            name: 'Tipo Actividad',
            selector: row => row.Tipo_Actividad,
            sortable: true
        },
        {
            name: 'Fecha',
            selector: row => row.Fecha_Actividad ? row.Fecha_Actividad.split('T')[0].split('-').reverse().join('/') : 'N/A',
            sortable: true
        },
        {
            name: 'Medicamento(s)',
            selector: row => getNombresMedicamentos(row.Id_Medicamento),
            wrap: true
        },
        {
            name: 'Responsable(s)',
            selector: row => getNombresResponsables(row.Id_Responsable),
            wrap: true
        },
        {
            name: 'Observaciones',
            selector: row => row.Observaciones || 'N/A'
        },
        {
            name: 'Acciones',
            cell: row => (
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(row.Id_Actividad)}
                    title="Eliminar Actividad"
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            ),
            width: '90px'
        }
    ]

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className="mb-4 bg-light p-3 rounded shadow-sm">
                <h6 className="mb-3 fw-bold">Registrar Nueva Actividad</h6>
                <div className="row g-3">
                    {/* TIPO ACTIVIDAD */}
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Tipo Actividad</label>
                        <select
                            className="form-select"
                            required
                            value={tipoSelect}
                            onChange={e => setTipoSelect(e.target.value)}
                        >
                            <option value="">Selecciona...</option>
                            <option value="Vacunación">Vacunación</option>
                            <option value="Desparasitación">Desparasitación</option>
                            <option value="Pesaje">Pesaje</option>
                            <option value="Corte de cola">Corte de cola</option>
                            <option value="Corte de colmillos">Corte de colmillos</option>
                            <option value="Castración">Castración</option>
                            <option value="Aplicación hierro">Aplicación hierro</option>
                            <option value="Otro">Otro</option>
                        </select>
                        {tipoSelect === 'Otro' && (
                            <input
                                type="text"
                                className="form-control mt-2"
                                placeholder="Escriba la otra actividad..."
                                required
                                value={otraActividad}
                                onChange={e => setOtraActividad(e.target.value)}
                            />
                        )}
                    </div>

                    {/* FECHA */}
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Fecha</label>
                        <input
                            type="date"
                            className="form-control"
                            required
                            value={fechaActividad}
                            onChange={e => setFechaActividad(e.target.value)}
                        />
                    </div>

                    {/* OBSERVACIONES */}
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Observaciones</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Detalles opcionales..."
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                        />
                    </div>
                </div>

                {/* MULTI-SELECCIÓN DE MEDICAMENTOS */}
                <div className="mt-3">
                    <label className="form-label fw-semibold d-block">
                        💊 Medicamentos ({selectedMedicamentos.length})
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                        {medicamentos.length === 0 ? (
                            <span className="text-muted small">No hay medicamentos registrados</span>
                        ) : (
                            medicamentos.map(m => {
                                const activo = selectedMedicamentos.includes(Number(m.Id_Medicamento))
                                return (
                                    <span
                                        key={m.Id_Medicamento}
                                        onClick={() => toggleMedicamento(m.Id_Medicamento)}
                                        className={`px-3 py-1.5 rounded-pill user-select-none ${
                                            activo
                                                ? "bg-primary text-white shadow-sm fw-bold"
                                                : "bg-white border text-secondary"
                                        }`}
                                        style={{ cursor: "pointer", fontSize: "13px" }}
                                    >
                                        {activo ? "✓ " : "+ "}{m.Nombre}
                                    </span>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* MULTI-SELECCIÓN DE RESPONSABLES */}
                <div className="mt-3">
                    <label className="form-label fw-semibold d-block">
                        👨‍🌾 Responsables ({selectedResponsables.length})
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                        {responsables.length === 0 ? (
                            <span className="text-muted small">No hay responsables registrados</span>
                        ) : (
                            responsables.map(r => {
                                const activo = selectedResponsables.includes(Number(r.Id_Responsable))
                                return (
                                    <span
                                        key={r.Id_Responsable}
                                        onClick={() => toggleResponsable(r.Id_Responsable)}
                                        className={`px-3 py-1.5 rounded-pill user-select-none ${
                                            activo
                                                ? "bg-success text-white shadow-sm fw-bold"
                                                : "bg-white border text-secondary"
                                        }`}
                                        style={{ cursor: "pointer", fontSize: "13px" }}
                                    >
                                        {activo ? "✓ " : "+ "}{r.Nombres} {r.Apellidos || ''}
                                    </span>
                                )
                            })
                        )}
                    </div>
                </div>

                <button type="submit" className="btn btn-success mt-3 shadow-sm">
                    <i className="fa-solid fa-plus me-1"></i> Agregar Actividad
                </button>
            </form>

            <DataTable
                columns={columns}
                data={actividades}
                noDataComponent="No hay actividades registradas en esta sesión"
                striped
                highlightOnHover
            />
        </div>
    )
}

export default SubActividades
