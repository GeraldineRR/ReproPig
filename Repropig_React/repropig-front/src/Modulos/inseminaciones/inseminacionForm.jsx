import { useEffect, useState, useRef } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

const InseminacionForm = ({ hideModal, rowToEdit = {}, refreshTable, preloaded = {} }) => {
    const MySwal = WithReactContent(Swal)

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
    const [textFormButton, setTextFormButton] = useState('Agregar Inseminacion');

    // ✅ useRef para evitar loop infinito con preloaded
    const preloadedRef = useRef(null)

    useEffect(() => {
        getPorcinos()
        getResponsables()
        getColectas()
    }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino')
            setPorcinos(response.data)
        } catch (error) {
            console.error('Error al obtener porcinos:', error);
        }
    }

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables')
            setResponsables(response.data)
        } catch (error) {
            console.error('Error al obtener responsables:', error);
        }
    }

    const getColectas = async () => {
        try {
            const response = await apiAxios.get('/colectas')
            setColectas(response.data)
        } catch (error) {
            console.error('Error al obtener colectas:', error);
        }
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

    // ✅ useEffect para rowToEdit (edición)
    useEffect(() => {
        if (rowToEdit.Id_Inseminacion) {
            setFec_hora(rowToEdit.Fec_hora?.split('T')[0] || '')
            setId_Porcino(rowToEdit.Id_Porcino)
            setCantidad(rowToEdit.cantidad)
            setId_Responsable(parsearResponsables(rowToEdit.Id_Responsable))
            setId_colecta(rowToEdit.Id_colecta)
            setObservaciones(rowToEdit.Observaciones)
            setId_Reproduccion(rowToEdit.Id_Reproduccion)
            setTextFormButton('Actualizar Inseminacion')
        } else if (!preloaded.Id_Reproduccion) {
            // Solo limpiar si no hay preloaded
            setFec_hora('')
            setId_Porcino('')
            setCantidad('')
            setId_Responsable([])
            setId_colecta('')
            setObservaciones('')
            setId_Reproduccion('')
            setTextFormButton('Agregar Inseminacion')
        }
    }, [rowToEdit]);

    // ✅ useEffect separado para preloaded — solo corre una vez por instancia
    useEffect(() => {
        if (preloaded.Id_Reproduccion && preloadedRef.current !== preloaded.Id_Reproduccion) {
            preloadedRef.current = preloaded.Id_Reproduccion
            setId_Porcino(preloaded.Id_Porcino || '')
            setId_colecta(preloaded.Id_colecta || '')
            setId_Reproduccion(preloaded.Id_Reproduccion || '')
            setFec_hora('')
            setCantidad('')
            setId_Responsable([])
            setId_colecta('')
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
            Fec_hora,
            Id_Porcino,
            cantidad,
            Id_Responsable: JSON.stringify(Id_Responsable),
            Id_colecta,
            Observaciones,
            Id_Reproduccion,
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
                    onChange={e => setId_Porcino(e.target.value)}
                    disabled={esPrellenado} required>
                    <option value="">Seleccione</option>
                    {porcinos.map(p => (
                        <option key={p.Id_Porcino} value={p.Id_Porcino}>{p.Nom_Porcino}</option>
                    ))}
                </select>
                {esPrellenado && <small className="text-muted">Asignado desde la reproducción</small>}
            </div>

            <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input type="number" step="0.01" className="form-control" value={cantidad}
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
                            <option key={c.Id_colecta} value={c.Id_colecta}
                                disabled={disponibles <= 0}>
                                #{c.Id_colecta} — {c.Fecha?.split('T')[0] || c.Fecha} — {c.Tipo || 'Sin tipo'} — 🧪 {disponibles} pajillas disponibles
                            </option>
                        )
                    })}
                </select>
                {preloaded.Id_colecta && <small className="text-muted">Asignado desde la colecta</small>}
            </div>

            <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea className="form-control" value={Observaciones}
                    onChange={e => setObservaciones(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Id Reproducción</label>
                <input type="text" className="form-control" value={Id_Reproduccion}
                    onChange={e => setId_Reproduccion(e.target.value)}
                    disabled={esPrellenado} required />
                {esPrellenado && <small className="text-muted">Asignado automáticamente</small>}
            </div>

            <input type="submit" className="btn btn-primary w-50" value={textFormButton} />
        </form>
    );
};

export default InseminacionForm;