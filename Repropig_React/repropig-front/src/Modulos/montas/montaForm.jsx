import { useEffect, useState, useRef } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import { useNavigate } from 'react-router-dom'

const MontaForm = ({ hideModal, rowToEdit = {}, refreshTable, preloaded = {} }) => {
    const MySwal = WithReactContent(Swal)
    const navigate = useNavigate()

    const [Fec_hora, setFec_hora] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [Id_Responsable, setId_Responsable] = useState([]);
    const [Observaciones, setObservaciones] = useState('');
    const [Id_Reproduccion, setId_Reproduccion] = useState('');
    const [porcinos, setPorcinos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [reproduccionesActivas, setReproduccionesActivas] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Agregar Monta');

    const preloadedRef = useRef(null)

    useEffect(() => {
        getPorcinos()
        getResponsables()
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

    const getReproduccionesActivas = async (idPorcino) => {
        if (!idPorcino) { setReproduccionesActivas([]); return }
        try {
            const response = await apiAxios.get('/reproducciones/')
            const activas = response.data.filter(r =>
                r.Id_Cerda == idPorcino &&
                r.Activo === 'Si' &&
                r.TipoReproduccion === 'Monta'
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
        if (rowToEdit.Id_Monta) {
            setFec_hora(rowToEdit.Fec_hora?.split('T')[0] || '')
            setId_Porcino(rowToEdit.Id_Porcino)
            setId_Responsable(parsearResponsables(rowToEdit.Id_Responsable))
            setObservaciones(rowToEdit.Observaciones)
            setId_Reproduccion(rowToEdit.Id_Reproduccion)
            getReproduccionesActivas(rowToEdit.Id_Porcino)
            setTextFormButton('Actualizar Monta')
        } else if (!preloaded.Id_Reproduccion) {
            setFec_hora('')
            setId_Porcino('')
            setId_Responsable([])
            setObservaciones('')
            setId_Reproduccion('')
            setReproduccionesActivas([])
            setTextFormButton('Agregar Monta')
        }
    }, [rowToEdit]);

    useEffect(() => {
        if (preloaded.Id_Reproduccion && preloadedRef.current !== preloaded.Id_Reproduccion) {
            preloadedRef.current = preloaded.Id_Reproduccion
            setId_Porcino(preloaded.Id_Porcino || '')
            setId_Reproduccion(preloaded.Id_Reproduccion || '')
            setFec_hora('')
            setId_Responsable([])
            setObservaciones('')
            setTextFormButton('Agregar Monta')
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
            Fec_hora, Id_Porcino,
            Id_Responsable: JSON.stringify(Id_Responsable),
            Observaciones, Id_Reproduccion,
        };
        try {
            if (textFormButton === 'Agregar Monta') {
                await apiAxios.post('/monta', formData)
                MySwal.fire({ title: "Registro exitoso", text: "Monta creada con éxito", icon: "success" })
            } else {
                await apiAxios.put('/monta/' + rowToEdit.Id_Monta, formData)
                MySwal.fire({ title: "Actualización exitosa", text: "Monta actualizada con éxito", icon: "success" })
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
                <div className="alert alert-success py-2 mb-3">
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
                                    ? 'No hay reproducciones de Monta activas'
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
                            <small className="d-block mb-2">⚠️ Esta cerda no tiene reproducciones de Monta activas.</small>
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
                                id={`resp-monta-${resp.Id_Responsable}`}
                                checked={Id_Responsable.includes(resp.Id_Responsable)}
                                onChange={() => toggleResponsable(resp.Id_Responsable)} />
                            <label className="form-check-label" htmlFor={`resp-monta-${resp.Id_Responsable}`}>
                                {resp.Nombres} {resp.Apellidos}
                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>{resp.Cargo}</span>
                            </label>
                        </div>
                    ))}
                </div>
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

export default MontaForm;