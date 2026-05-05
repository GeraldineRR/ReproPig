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
    const [machos, setMachos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [colectas, setColectas] = useState([]);
    const [reproduccionesActivas, setReproduccionesActivas] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Agregar Inseminacion');
    const [filtroCerdo, setFiltroCerdo] = useState('');

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
            setMachos(response.data.filter(p => p.Gen_Porcino === 'M'))
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

    // ✅ FIX — se quitó el filtro de TipoReproduccion === 'Inseminacion'
    // Una cerda con reproducción activa de cualquier tipo puede recibir una inseminación
    const getReproduccionesActivas = async (idPorcino) => {
        if (!idPorcino) { setReproduccionesActivas([]); return }
        try {
            const response = await apiAxios.get('/reproducciones/')
            const activas = response.data.filter(r =>
                r.Id_Cerda == idPorcino &&
                r.Activo === 'S'
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

    // ✅ FIX — ahora llama getReproduccionesActivas al editar para que el select se llene
    useEffect(() => {
        if (rowToEdit.Id_Inseminacion) {
            setFec_hora(rowToEdit.Fec_hora?.split('T')[0] || '')
            setId_Porcino(rowToEdit.Id_Porcino)
            setCantidad(rowToEdit.cantidad)
            setId_Responsable(parsearResponsables(rowToEdit.Id_Responsable))
            setId_colecta(rowToEdit.Id_colecta)
            setObservaciones(rowToEdit.Observaciones)
            setId_Reproduccion(rowToEdit.Id_Reproduccion)
            getReproduccionesActivas(rowToEdit.Id_Porcino) // ✅ carga repros para que el select no quede vacío
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
            getReproduccionesActivas(preloaded.Id_Porcino)
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
    const esEdicion = !!rowToEdit?.Id_Inseminacion

    return (
        <form onSubmit={gestionarForm} className="w-100">

            <div className="text-center mb-4">
                <h5 className="fw-bold">💉 {esEdicion ? 'Editar Inseminación' : 'Registrar Inseminación'}</h5>
                <small className="text-muted">Gestión del proceso reproductivo</small>
            </div>

            {esPrellenado && (
                <div className="alert alert-primary py-2 mb-3 text-center">
                    Cerda y reproducción asignadas automáticamente
                </div>
            )}

            <div className="row g-3">

                {/* FECHA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha</label>
                    <input
                        type="date"
                        className="form-control shadow-sm"
                        value={Fec_hora}
                        onChange={e => setFec_hora(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
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
                        disabled={esPrellenado || esEdicion}
                        required
                    >
                        <option value="">Seleccione</option>
                        {porcinos.map(p => (
                            <option key={p.Id_Porcino} value={p.Id_Porcino}>
                                {p.Nom_Porcino}
                            </option>
                        ))}
                    </select>
                </div>

                {/* REPRODUCCION — se muestra siempre, bloqueada si viene prellenada */}
                <div className="col-12">
                    <label className="form-label fw-semibold">🔁 Reproducción activa</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Reproduccion}
                        onChange={e => setId_Reproduccion(e.target.value)}
                        disabled={esPrellenado || esEdicion}
                        required
                    >
                        <option value="">
                            {!Id_Porcino
                                ? 'Primero seleccione una cerda'
                                : reproduccionesActivas.length === 0
                                    ? 'No hay reproducciones activas'
                                    : 'Seleccione una reproducción'}
                        </option>
                        {reproduccionesActivas.map(r => (
                            <option key={r.Id_Reproduccion} value={r.Id_Reproduccion}>
                                #{r.Id_Reproduccion} — {r.TipoReproduccion}
                            </option>
                        ))}
                    </select>
                </div>

                {/* COLECTA */}
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-semibold mb-0">📦 Colecta</label>
                        <div className="d-flex align-items-center gap-2">
                            <small className="text-muted">Filtrar por cerdo:</small>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: 'auto', minWidth: '160px' }}
                                value={filtroCerdo}
                                onChange={e => { setFiltroCerdo(e.target.value); setId_colecta('') }}
                                disabled={!!preloaded.Id_colecta}
                            >
                                <option value="">🐗 Todos los cerdos</option>
                                {machos.map(m => (
                                    <option key={m.Id_Porcino} value={m.Id_Porcino}>
                                        {m.Nom_Porcino}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <select
                        className="form-select shadow-sm"
                        value={Id_colecta}
                        onChange={e => setId_colecta(e.target.value)}
                        disabled={!!preloaded.Id_colecta || !Fec_hora}
                        required
                    >
                        <option value="">
                            {!Fec_hora ? 'Primero seleccione la fecha de inseminación' : 'Seleccione una colecta'}
                        </option>
                        {colectas
                            .filter(c => {
                                if (filtroCerdo && c.Id_Porcino != filtroCerdo) return false;
                                if (c.Id_colecta == Id_colecta) return true; // Siempre mostrar la ya seleccionada
                                if (!Fec_hora || !c.Fecha) return false;
                                
                                const tInsem = new Date(Fec_hora + 'T00:00:00').getTime();
                                const tCol = new Date(c.Fecha.split('T')[0] + 'T00:00:00').getTime();
                                const diasDif = Math.round((tInsem - tCol) / (1000 * 60 * 60 * 24));

                                if (diasDif < 0) return false; // Colecta posterior a la fecha de inseminación
                                if (c.Tipo === 'Interno' && diasDif !== 0) return false; // Interna: solo el mismo día
                                if (c.Tipo === 'Externo' && diasDif > 3) return false; // Externa: hasta 3 días

                                return true;
                            })
                            .map(c => {
                                const disponibles = (c.cant_generada || 0) - (c.cant_utilizada || 0)
                                
                                // Para mostrar mensaje visual si es la seleccionada pero no cumple las reglas (datos viejos)
                                let mensajeVencida = "";
                                if (Fec_hora && c.Fecha) {
                                    const tInsem = new Date(Fec_hora + 'T00:00:00').getTime();
                                    const tCol = new Date(c.Fecha.split('T')[0] + 'T00:00:00').getTime();
                                    const diasDif = Math.round((tInsem - tCol) / (1000 * 60 * 60 * 24));
                                    if (c.Tipo === 'Interno' && diasDif !== 0) mensajeVencida = " (Vencida)";
                                    if (c.Tipo === 'Externo' && diasDif > 3) mensajeVencida = " (Vencida)";
                                }

                                return (
                                    <option key={c.Id_colecta} value={c.Id_colecta} disabled={disponibles <= 0 && c.Id_colecta != Id_colecta}>
                                        #{c.Id_colecta} — {c.porcino?.Nom_Porcino || `Cerdo #${c.Id_Porcino}`} — {disponibles} disponibles {mensajeVencida}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>

                {/* CANTIDAD */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🧪 Cantidad</label>
                    <input
                        type="number"
                        className="form-control shadow-sm"
                        value={cantidad}
                        onChange={e => setCantidad(e.target.value)}
                        required
                    />
                </div>

            </div>

            {/* RESPONSABLES */}
            <div className="mt-4">
                <label className="form-label fw-semibold">
                    👨‍🌾 Responsables ({Id_Responsable.length})
                </label>
                <div className="d-flex flex-wrap gap-2">
                    {responsables.map(r => {
                        const activo = Id_Responsable.includes(r.Id_Responsable)
                        return (
                            <span
                                key={r.Id_Responsable}
                                onClick={() => toggleResponsable(r.Id_Responsable)}
                                className={`px-3 py-2 rounded-pill ${activo
                                    ? "bg-primary text-white shadow"
                                    : "bg-light border"
                                    }`}
                                style={{ cursor: "pointer", fontSize: "13px", transition: "0.2s" }}
                            >
                                {r.Nombres}
                            </span>
                        )
                    })}
                </div>
            </div>

            {/* OBSERVACIONES */}
            <div className="mt-4">
                <label className="form-label fw-semibold">📝 Observaciones</label>
                <textarea
                    className="form-control shadow-sm"
                    rows="2"
                    value={Observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                />
            </div>

            {/* BOTÓN */}
            <div className="d-grid mt-4">
                <button className="btn btn-primary fw-semibold py-2 shadow-sm">
                    {textFormButton}
                </button>
            </div>

        </form>
    );
};

export default InseminacionForm;