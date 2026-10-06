import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Seguimiento_CerdaForm = ({ hideModal, Seguimiento_CerdaEdit, reload }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Seguimiento_Cerda, setId_Seguimiento_Cerda] = useState('')
    const [Fecha, setFecha] = useState('')
    const [Hora, setHora] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [Id_Porcino, setId_Porcino] = useState('')
    const [Id_Responsable, setId_Responsable] = useState([])
    const [Id_Medicamento, setId_Medicamento] = useState([])
    const [Id_Ciclo, setId_Ciclo] = useState('')

    const [porcinos, setPorcinos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [ciclosActivas, setCiclosActivas] = useState([])

    const [showResponsables, setShowResponsables] = useState(false)
    const [showMedicamentos, setShowMedicamentos] = useState(false)

    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getPorcinos()
        getResponsables()
        getMedicamentos()
    }, [])

    const parsearMultiples = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === 'string' && val.startsWith('[')) {
            try { return JSON.parse(val).map(String); } catch { return []; }
        }
        return [String(val)];
    };

    useEffect(() => {
        if (Seguimiento_CerdaEdit) {
            setId_Seguimiento_Cerda(Seguimiento_CerdaEdit.Id_Seguimiento_Cerda ?? '')
            setFecha(Seguimiento_CerdaEdit.Fecha?.split('T')[0] ?? '')
            setHora(Seguimiento_CerdaEdit.Hora ?? '')
            setObservaciones(Seguimiento_CerdaEdit.Observaciones ?? '')
            setId_Porcino(Seguimiento_CerdaEdit.Id_Porcino ?? '')
            setId_Responsable(parsearMultiples(Seguimiento_CerdaEdit.Id_Responsable))
            setId_Medicamento(parsearMultiples(Seguimiento_CerdaEdit.Id_Medicamento))
            setId_Ciclo(Seguimiento_CerdaEdit.Id_Ciclo ?? '')
            setTextFormButton("Actualizar")

            // Cargar ciclos de esa cerda para edición
            if (Seguimiento_CerdaEdit.Id_Porcino) {
                getCiclosActivas(Seguimiento_CerdaEdit.Id_Porcino)
            }
        } else {
            setId_Seguimiento_Cerda('')
            setFecha('')
            setHora('')
            setObservaciones('')
            setId_Porcino('')
            setId_Responsable([])
            setId_Medicamento([])
            setId_Ciclo('')
            setCiclosActivas([])
            setTextFormButton("Enviar")
        }
    }, [Seguimiento_CerdaEdit])

    const getPorcinos = async () => {
        try {
            const [porcinosRes, ciclosRes] = await Promise.all([
                apiAxios.get('/porcino/'),
                apiAxios.get('/ciclos/')
            ]);
            const activeCiclosSows = new Set(
                ciclosRes.data
                    .filter(c => (c.Estado || '').toUpperCase() === 'ACTIVO')
                    .map(c => c.Id_Cerda)
            );
            
            setPorcinos(porcinosRes.data.filter(p => 
                p.Gen_Porcino === 'H' && 
                p.Tipo_Cerdo === 'Adulto' &&
                (activeCiclosSows.has(p.Id_Porcino) || (Seguimiento_CerdaEdit && Seguimiento_CerdaEdit.Id_Porcino === p.Id_Porcino))
            ));
        } catch (error) {
            console.error('Error obteniendo porcinos y ciclos:', error)
            setPorcinos([])
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            // Filtrar activos o si ya está seleccionado en edición
            setResponsables(res.data.filter(r => 
                r.Estado === 'Activo' || (Seguimiento_CerdaEdit && Seguimiento_CerdaEdit.Id_Responsable === r.Id_Responsable)
            ))
        } catch (error) {
            console.error('Error obteniendo responsables:', error)
            setResponsables([])
        }
    }

    const getMedicamentos = async () => {
        try {
            const medicamentos = await apiAxios.get('/medicamentos/')
            setMedicamentos(medicamentos.data)
        } catch (error) {
            console.error('Error obteniendo medicamentos:', error)
            setMedicamentos([])
        }
    }

    const getCiclosActivas = async (idPorcino) => {
        if (!idPorcino) { setCiclosActivas([]); return }
        try {
            const response = await apiAxios.get('/ciclos/')
            const activas = response.data.filter(r =>
                r.Id_Cerda == idPorcino && (r.Estado || '').toUpperCase() === 'ACTIVO'
            )
            setCiclosActivas(activas)
        } catch (error) {
            console.error('Error obteniendo ciclos:', error)
            setCiclosActivas([])
        }
    }

    const handlePorcinoChange = (e) => {
        const val = e.target.value
        setId_Porcino(val)
        setId_Ciclo('')
        getCiclosActivas(val)
    }

    const toggleResponsable = (id) => {
        setId_Responsable(prev =>
            prev.includes(String(id)) ? prev.filter(r => r !== String(id)) : [...prev, String(id)]
        )
    }

    const toggleMedicamento = (id) => {
        setId_Medicamento(prev =>
            prev.includes(String(id)) ? prev.filter(m => m !== String(id)) : [...prev, String(id)]
        )
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        const formatMultiField = (val) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null;
            if (Array.isArray(val)) {
                return val.length === 1 ? val[0] : JSON.stringify(val);
            }
            return val;
        };

        const data = {
            Fecha,
            Hora,
            Observaciones,
            Id_Porcino,
            Id_Responsable: formatMultiField(Id_Responsable),
            Id_Medicamento: formatMultiField(Id_Medicamento),
            Id_Ciclo: Id_Ciclo || null
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/Seguimiento_Cerda/', data)
            } else {
                await apiAxios.put(
                    `/Seguimiento_Cerda/${Id_Seguimiento_Cerda}`,
                    data
                )
            }

            MySwal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Seguimiento guardado correctamente'
            })

            hideModal()
            if (reload) reload()

        } catch (error) {
            console.error(error.response?.data || error.message)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el Seguimiento'
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="text-center mb-4">
                        <h5 className="fw-bold">📋 Seguimiento de Cerda</h5>
                        <small className="text-muted">Registro vinculado al ciclo</small>
                    </div>

            <div className="row g-3">

                {/* FECHA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha</label>
                    <input
                        type="date"
                        className="form-control shadow-sm"
                        value={Fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                    />
                </div>

                {/* HORA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🕐 Hora</label>
                    <input
                        type="time"
                        className="form-control shadow-sm"
                        value={Hora}
                        onChange={(e) => setHora(e.target.value)}
                        required
                    />
                </div>

                {/* CERDA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🐷 Cerda</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Porcino}
                        onChange={handlePorcinoChange}
                        required
                    >
                        <option value="">Seleccione una cerda</option>
                        {porcinos.map((porcino) => (
                            <option key={porcino.Id_Porcino} value={porcino.Id_Porcino}>
                                {porcino.Nom_Porcino}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CICLO ACTIVO */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🔁 Ciclo</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Ciclo}
                        onChange={(e) => setId_Ciclo(e.target.value)}
                    >
                        <option value="">
                            {!Id_Porcino
                                ? 'Primero seleccione una cerda'
                                : ciclosActivas.length === 0
                                    ? 'Sin ciclos activos'
                                    : 'Seleccione un ciclo'}
                        </option>
                        {ciclosActivas.map(r => (
                            <option key={r.Id_Ciclo} value={r.Id_Ciclo}>
                                #{r.Id_Ciclo} — {r.TipoCiclo}
                            </option>
                        ))}
                    </select>
                </div>

                {/* RESPONSABLE */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">👨‍🌾 Responsables ({Id_Responsable.length})</label>
                    
                    <div 
                        className="form-select shadow-sm d-flex justify-content-between align-items-center" 
                        onClick={() => setShowResponsables(!showResponsables)}
                        style={{ cursor: "pointer", userSelect: "none" }}
                    >
                        <span>{Id_Responsable.length === 0 ? "Seleccionar responsables..." : `${Id_Responsable.length} seleccionados`}</span>
                    </div>

                    {showResponsables && (
                        <div className="border rounded mt-1 p-2 bg-white shadow-sm position-absolute z-3" style={{ maxHeight: "200px", overflowY: "auto", width: "95%" }}>
                            <div className="d-flex flex-wrap gap-2">
                                {responsables.map((r) => {
                                    const activo = Id_Responsable.includes(String(r.Id_Responsable))
                                    return (
                                        <span
                                            key={r.Id_Responsable}
                                            onClick={(e) => { e.stopPropagation(); toggleResponsable(r.Id_Responsable); }}
                                            className={`px-3 py-1.5 rounded-pill user-select-none ${
                                                activo
                                                    ? "bg-primary text-white shadow-sm fw-bold"
                                                    : "bg-white border text-secondary"
                                            }`}
                                            style={{ cursor: "pointer", fontSize: "13px" }}
                                        >
                                            {activo ? "✓ " : "+ "}{r.Nombres} {r.Apellidos}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* MEDICAMENTO */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">💊 Medicamentos ({Id_Medicamento.length})</label>
                    
                    <div 
                        className="form-select shadow-sm d-flex justify-content-between align-items-center" 
                        onClick={() => setShowMedicamentos(!showMedicamentos)}
                        style={{ cursor: "pointer", userSelect: "none" }}
                    >
                        <span>{Id_Medicamento.length === 0 ? "Seleccionar medicamentos..." : `${Id_Medicamento.length} seleccionados`}</span>
                    </div>

                    {showMedicamentos && (
                        <div className="border rounded mt-1 p-2 bg-white shadow-sm position-absolute z-3" style={{ maxHeight: "200px", overflowY: "auto", width: "95%" }}>
                            <div className="d-flex flex-wrap gap-2">
                                {medicamentos.map((m) => {
                                    const activo = Id_Medicamento.includes(String(m.Id_Medicamento))
                                    return (
                                        <span
                                            key={m.Id_Medicamento}
                                            onClick={(e) => { e.stopPropagation(); toggleMedicamento(m.Id_Medicamento); }}
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
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* OBSERVACIONES */}
                <div className="col-12">
                    <label className="form-label fw-semibold">📝 Observaciones</label>
                    <textarea
                        className="form-control shadow-sm"
                        value={Observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows="2"
                    />
                </div>

            </div>

            {/* BOTÓN */}
            <div className="d-grid mt-4">
                <button className="btn btn-primary fw-semibold py-2 shadow-sm">
                    {textFormButton}
                </button>
            </div>

        </form>
    )
}

export default Seguimiento_CerdaForm