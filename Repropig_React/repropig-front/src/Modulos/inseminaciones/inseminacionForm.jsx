import { useEffect, useState, useRef } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import { useNavigate } from 'react-router-dom'

const InseminacionForm = ({ hideModal, rowToEdit = {}, refreshTable, preloaded = {} }) => {
    const MySwal = WithReactContent(Swal)
    const navigate = useNavigate()

    const [Fec_hora, setFec_hora] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [Id_Responsable, setId_Responsable] = useState([]);
    const [Id_colecta, setId_colecta] = useState('');
    const [Observaciones, setObservaciones] = useState('');
    const [Id_Reproduccion, setId_Reproduccion] = useState('');
    const [porcinos, setPorcinos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [colectas, setColectas] = useState([]);
    const [reproduccionesActivas, setReproduccionesActivas] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Agregar Inseminacion');

    const preloadedRef = useRef(null)

    useEffect(() => {
        getPorcinos()
        getResponsables()
        getColectas()
    }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino')
            setPorcinos(response.data.filter(p => p.Gen_Porcino === 'H'))
        } catch (error) { console.error('Error al obtener porcinos:', error) }
    }

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables')
            setResponsables(response.data)
        } catch (error) { console.error('Error al obtener responsables:', error) }
    }

    const getColectas = async () => {
        try {
            const response = await apiAxios.get('/colectas')
            setColectas(response.data)
        } catch (error) { console.error('Error al obtener colectas:', error) }
    }

    const getReproduccionesActivas = async (idPorcino) => {
        if (!idPorcino) { setReproduccionesActivas([]); return }
        try {
            const response = await apiAxios.get('/reproducciones/')
            const activas = response.data.filter(r =>
                r.Id_Cerda == idPorcino &&
                r.Activo === 'Si' &&
                r.TipoReproduccion === 'Inseminacion'
            )
            setReproduccionesActivas(activas)
        } catch (error) { console.error('Error al obtener reproducciones:', error) }
    }

    const handlePorcinoChange = (e) => {
        const val = e.target.value
        setId_Porcino(val)
        setId_Reproduccion('')
        getReproduccionesActivas(val)
    }

    const parsearResponsables = (valor) => {
        if (!valor) return []
        if (Array.isArray(valor)) return valor.map(Number)
        if (typeof valor === 'string' && valor.startsWith('[')) {
            try { return JSON.parse(valor).map(Number) } catch { return [] }
        }
        const num = Number(valor)
        return isNaN(num) ? [] : [num]
    }

    useEffect(() => {
        if (rowToEdit.Id_Inseminacion) {
            setFec_hora(rowToEdit.Fec_hora?.split('T')[0] || '')
            setId_Porcino(rowToEdit.Id_Porcino)
            setCantidad(rowToEdit.cantidad)
            setId_Responsable(parsearResponsables(rowToEdit.Id_Responsable))
            setId_colecta(rowToEdit.Id_colecta)
            setObservaciones(rowToEdit.Observaciones)
            setId_Reproduccion(rowToEdit.Id_Reproduccion)
            getReproduccionesActivas(rowToEdit.Id_Porcino)
            setTextFormButton('Actualizar Inseminacion')
        } else if (!preloaded.Id_Reproduccion) {
            setFec_hora('')
            setId_Porcino('')
            setCantidad('')
            setId_Responsable([])
            setId_colecta('')
            setObservaciones('')
            setId_Reproduccion('')
            setReproduccionesActivas([])
            setTextFormButton('Agregar Inseminacion')
        }
    }, [rowToEdit]);

    useEffect(() => {
        if (preloaded.Id_Reproduccion && preloadedRef.current !== preloaded.Id_Reproduccion) {
            preloadedRef.current = preloaded.Id_Reproduccion
            setId_Porcino(preloaded.Id_Porcino || '')
            setId_colecta(preloaded.Id_colecta || '')
            setId_Reproduccion(preloaded.Id_Reproduccion || '')
            setFec_hora('')
            setCantidad('')
            setId_Responsable([])
            setObservaciones('')
            setTextFormButton('Agregar Inseminacion')
        }
    }, [preloaded.Id_Reproduccion]);

    const toggleResponsable = (id) => {
        setId_Responsable(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        )
    }

    const gestionarForm = async (e) => {
        e.preventDefault();
        if (Id_Responsable.length === 0) {
            MySwal.fire({ icon: 'warning', title: 'Requerido', text: 'Debes seleccionar al menos un responsable' })
            return
        }
        const formData = {
            Fec_hora, Id_Porcino, cantidad,
            Id_Responsable: JSON.stringify(Id_Responsable),
            Id_colecta, Observaciones, Id_Reproduccion,
        };
        try {
            if (textFormButton === 'Agregar Inseminacion') {
                await apiAxios.post('/inseminacion', formData)
                MySwal.fire({ title: "Registro exitoso", text: "Inseminacion creada con éxito", icon: "success" })
            } else {
                await apiAxios.put('/inseminacion/' + rowToEdit.Id_Inseminacion, formData)
                MySwal.fire({ title: "Actualización exitosa", text: "Inseminacion actualizada con éxito", icon: "success" })
            }
            hideModal()
            refreshTable()
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
        }
    };

    const esPrellenado = !!preloaded.Id_Reproduccion

    return (
        <form onSubmit={gestionarForm} className="col-12 col-md-8">

            {esPrellenado && (
                <div className="alert alert-primary py-2 mb-3">
                    <i className="fa-solid fa-circle-check me-2"></i>
                    Cerda y reproducción asignadas automáticamente.
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">Fecha</label>
                <input type="date" className="form-control" value={Fec_hora}
                    onChange={e => setFec_hora(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label className="form-label">Porcino (Cerda)</label>
                <select className="form-select" value={Id_Porcino}
                    onChange={handlePorcinoChange}
                    disabled={esPrellenado} required>
                    <option value="">Seleccione</option>
                    {porcinos.map(p => (
                        <option key={p.Id_Porcino} value={p.Id_Porcino}>{p.Nom_Porcino}</option>
                    ))}
                </select>
                {esPrellenado && <small className="text-muted">Asignado desde la reproducción</small>}
            </div>

            {/* ✅ Select reproducción — solo si no es prellenado */}
            {!esPrellenado && (
                <div className="mb-3">
                    <label className="form-label">Reproducción activa</label>
                    <select className="form-select" value={Id_Reproduccion}
                        onChange={e => setId_Reproduccion(e.target.value)} required>
                        <option value="">
                            {!Id_Porcino
                                ? 'Primero seleccione una cerda'
                                : reproduccionesActivas.length === 0
                                    ? 'No hay reproducciones de Inseminación activas'
                                    : 'Seleccione una reproducción'}
                        </option>
                        {reproduccionesActivas.map(r => (
                            <option key={r.Id_Reproduccion} value={r.Id_Reproduccion}>
                                #{r.Id_Reproduccion} — {r.porcino?.Nom_Porcino || `Cerda #${r.Id_Cerda}`}
                            </option>
                        ))}
                    </select>
                    {Id_Porcino && reproduccionesActivas.length === 0 && (
                        <div className="alert alert-warning py-2 mt-2">
                            <small className="d-block mb-2">⚠️ Esta cerda no tiene reproducciones de Inseminación activas.</small>
                            <button type="button" className="btn btn-sm btn-warning fw-semibold"
                                onClick={() => { hideModal(); navigate('/reproducciones') }}>
                                ➕ Crear reproducción
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ Estos campos siempre se muestran */}
            <div className="mb-3">
                <label className="form-label">Cantidad de pajillas</label>
                <input type="number" className="form-control" value={cantidad}
                    onChange={e => setCantidad(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    Responsables <span className="text-danger">*</span>
                    <small className="text-muted fw-normal ms-2">
                        ({Id_Responsable.length} seleccionado{Id_Responsable.length !== 1 ? 's' : ''})
                    </small>
                </label>
                <div className="border rounded p-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {responsables.map(resp => (
                        <div key={resp.Id_Responsable} className="form-check">
                            <input className="form-check-input" type="checkbox"
                                id={`resp-inse-${resp.Id_Responsable}`}
                                checked={Id_Responsable.includes(resp.Id_Responsable)}
                                onChange={() => toggleResponsable(resp.Id_Responsable)} />
                            <label className="form-check-label" htmlFor={`resp-inse-${resp.Id_Responsable}`}>
                                {resp.Nombres} {resp.Apellidos}
                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>{resp.Cargo}</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Colecta</label>
                <select className="form-select" value={Id_colecta}
                    onChange={e => setId_colecta(e.target.value)}
                    disabled={!!preloaded.Id_colecta} required>
                    <option value="">Seleccione una colecta</option>
                    {colectas.map(c => {
                        const disponibles = (c.cant_generada || 0) - (c.cant_utilizada || 0)
                        return (
                            <option key={c.Id_colecta} value={c.Id_colecta} disabled={disponibles <= 0}>
                                #{c.Id_colecta} — {c.Fecha?.split('T')[0] || c.Fecha} — {c.Tipo || 'Sin tipo'} — {disponibles} pajillas disponibles
                            </option>
                        )
                    })}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea className="form-control" value={Observaciones}
                    onChange={e => setObservaciones(e.target.value)} />
            </div>

            <input type="submit" className="btn btn-primary w-50" value={textFormButton} />
        </form>
    );
};

export default InseminacionForm;