import { useEffect, useState } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

const MontaForm = ({ hideModal, rowToEdit = {}, refreshTable, preloaded = {} }) => {

    const MySwal = WithReactContent(Swal);

    const [Fec_hora, setFec_hora] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [Id_Cerdo, setId_Cerdo] = useState('');
    const [Id_Responsable, setId_Responsable] = useState([]);
    const [Observaciones, setObservaciones] = useState('');
    const [Id_Ciclo, setId_Ciclo] = useState('');
    const [hembras, setHembras] = useState([]);
    const [machos, setMachos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [ciclosActivas, setCiclosActivas] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Agregar Monta');

    useEffect(() => {
        getPorcinos();
        getResponsables();
    }, []);

    // ✅ NUEVO — maneja edición desde el CRUD normal
    useEffect(() => {
        if (rowToEdit?.Id_Monta) {
            // Es edición — cargar todos los datos del registro
            setFec_hora(rowToEdit.Fec_hora?.split('T')[0] || '')
            setId_Porcino(String(rowToEdit.Id_Porcino))
            setId_Cerdo(String(rowToEdit.Id_Cerdo || ''))
            setObservaciones(rowToEdit.Observaciones || '')
            setId_Ciclo(String(rowToEdit.Id_Ciclo))
            setTextFormButton('Actualizar Monta')

            // parsear responsables
            try {
                const raw = rowToEdit.Id_Responsable
                if (typeof raw === 'string' && raw.startsWith('[')) {
                    setId_Responsable(JSON.parse(raw).map(Number))
                } else {
                    setId_Responsable([Number(raw)])
                }
            } catch { setId_Responsable([]) }

            // ✅ cargar las ciclos de esa cerda para que el select no quede vacío
            getCiclosActivas(rowToEdit.Id_Porcino)

        } else if (!preloaded?.Id_Ciclo) {
            // Es nuevo y sin preloaded — limpiar todo
            setFec_hora('')
            setId_Porcino('')
            setId_Cerdo('')
            setId_Responsable([])
            setObservaciones('')
            setId_Ciclo('')
            setCiclosActivas([])
            setTextFormButton('Agregar Monta')
        }
    }, [rowToEdit]);

    // ✅ Maneja el prellenado cuando viene desde Ciclos
    useEffect(() => {
        if (!preloaded?.Id_Porcino || !preloaded?.Id_Ciclo) return;

        const cargarPreloaded = async () => {
            setId_Porcino(String(preloaded.Id_Porcino));
            setId_Ciclo(String(preloaded.Id_Ciclo));
            setFec_hora('')
            setId_Cerdo('')
            setId_Responsable([])
            setObservaciones('')
            setTextFormButton('Agregar Monta')

            const res = await apiAxios.get('/ciclos');
            const activas = res.data.filter(r =>
                r.Id_Cerda == preloaded.Id_Porcino && (r.activo || r.Activo || '').toUpperCase() === 'S'
            );
            setCiclosActivas(activas);
        };

        cargarPreloaded();
    }, [preloaded?.Id_Porcino, preloaded?.Id_Ciclo]);

    const getPorcinos = async () => {
        const res = await apiAxios.get('/porcino');
        setHembras(res.data.filter(p => p.Gen_Porcino === 'H'));
        setMachos(res.data.filter(p => p.Gen_Porcino === 'M'));
    };

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(res.data)
        } catch (error) {
            console.error("Error cargando responsables:", error)
        }
    }

    const getCiclosActivas = async (id) => {
        if (!id) return setCiclosActivas([]);
        const res = await apiAxios.get('/ciclos');
        // ✅ Al editar trae TODAS las ciclos de esa cerda (activas e inactivas)
        // para que el select pueda mostrar la que ya tiene asignada
        const todas = res.data.filter(r => r.Id_Cerda == id);
        setCiclosActivas(todas);
    };

    const handlePorcinoChange = (e) => {
        const val = e.target.value;
        setId_Porcino(val);
        setId_Ciclo('');
        // Al seleccionar nueva cerda, solo muestra activas
        getCiclosActivasSolo(val);
    };

    // ✅ Para cuando el usuario cambia la cerda manualmente (solo activas)
    const getCiclosActivasSolo = async (id) => {
        if (!id) return setCiclosActivas([]);
        const res = await apiAxios.get('/ciclos');
        const activas = res.data.filter(r => r.Id_Cerda == id && (r.activo || r.Activo || '').toUpperCase() === 'S');
        setCiclosActivas(activas);
    };

    const toggleResponsable = (id) => {
        setId_Responsable(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        if (Id_Responsable.length === 0) {
            return MySwal.fire('Error', 'Selecciona al menos un responsable', 'warning');
        }

        const data = {
            Fec_hora,
            Id_Porcino,
            Id_Cerdo,
            Id_Responsable: JSON.stringify(Id_Responsable),
            Observaciones,
            Id_Ciclo
        };

        try {
            if (textFormButton === 'Agregar Monta') {
                await apiAxios.post('/monta/', data);
                MySwal.fire('OK', 'Monta creada', 'success');
            } else {
                await apiAxios.put('/monta/' + rowToEdit.Id_Monta, data);
                MySwal.fire('OK', 'Monta actualizada', 'success');
            }

            // ✅ Auto-crear o actualizar calendario con la primera fecha
            try {
                const [calRes, montasRes, insemRes] = await Promise.all([
                    apiAxios.get(`/calendario/ciclo/${Id_Ciclo}`).catch(() => ({ data: null })),
                    apiAxios.get('/monta').catch(() => ({ data: [] })),
                    apiAxios.get('/inseminacion').catch(() => ({ data: [] }))
                ]);

                const misMontas = montasRes.data.filter(m => m.Id_Ciclo == Id_Ciclo);
                const misInsem = insemRes.data.filter(i => i.Id_Ciclo == Id_Ciclo);

                const allDates = [
                    ...misMontas.map(m => m.Fec_hora?.split('T')[0]).filter(Boolean),
                    ...misInsem.map(i => i.Fec_hora?.split('T')[0]).filter(Boolean)
                ];

                const minDate = allDates.length > 0 ? allDates.sort()[0] : Fec_hora;

                if (!calRes.data) {
                    await apiAxios.post('/calendario/', { Id_Ciclo, Fecha_Servicio: minDate });
                } else if (calRes.data.Fecha_Servicio?.split('T')[0] !== minDate) {
                    await apiAxios.put(`/calendario/${calRes.data.Id_Calendario}`, { Fecha_Servicio: minDate });
                }
            } catch (calErr) {
                console.error('Error al sincronizar calendario:', calErr);
            }

            hideModal();
            refreshTable();
        } catch (err) {
            MySwal.fire('Error', err.response?.data?.message || err.message, 'error');
        }
    };

    const esPrellenado = !!preloaded.Id_Ciclo;
    const esEdicion = !!rowToEdit?.Id_Monta;

    return (
        <form onSubmit={gestionarForm} className="w-100">

            <div className="text-center mb-4">
                <h5 className="fw-bold">🐷 {esEdicion ? 'Editar Monta' : 'Registrar Monta'}</h5>
                <small className="text-muted">Completa la información del proceso</small>
            </div>

            <div className="row g-3">

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
                        {hembras.map(p => (
                            <option key={p.Id_Porcino} value={p.Id_Porcino}>
                                {p.Nom_Porcino}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">🔁 Ciclo</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Ciclo}
                        onChange={e => setId_Ciclo(e.target.value)}
                        disabled={esPrellenado}
                        required
                    >
                        <option value="">Seleccione</option>
                        {ciclosActivas.map(r => (
                            <option key={r.Id_Ciclo} value={r.Id_Ciclo}>
                                #{r.Id_Ciclo} — {r.TipoCiclo}
                            </option>
                        ))}
                        {(() => {
                            if (ciclosActivas.length === 0 && !Id_Ciclo) {
                                return <option value="" disabled>No hay ciclos activos para esta cerda</option>;
                            }
                        })()}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">🐗 Cerdo</label>
                    <select
                    
                        className="form-select shadow-sm"
                        value={Id_Cerdo}
                        onChange={e => setId_Cerdo(e.target.value)}
                        required
                    >
                        <option value="">Seleccione</option>
                        {machos.map(p => (
                            <option key={p.Id_Porcino} value={p.Id_Porcino}>
                                {p.Nom_Porcino}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            <div className="mt-4">
                <label className="form-label fw-semibold">👨‍🌾 Responsables</label>
                <div className="d-flex flex-wrap gap-2">
                    {responsables.map(r => {
                        const activo = Id_Responsable.includes(r.Id_Responsable);
                        return (
                            <span
                                key={r.Id_Responsable}
                                onClick={() => toggleResponsable(r.Id_Responsable)}
                                className={`px-3 py-2 rounded-pill ${activo ? "bg-primary text-white shadow" : "bg-light border"}`}
                                style={{ cursor: "pointer", fontSize: "13px", transition: "all 0.2s ease" }}
                            >
                                {r.Nombres} {r.Apellidos}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4">
                <label className="form-label fw-semibold">📝 Observaciones</label>
                <textarea
                    className="form-control shadow-sm"
                    rows="2"
                    placeholder="Opcional..."
                    value={Observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                />
            </div>

            <div className="d-grid mt-4">
                <button className="btn btn-primary py-2 fw-semibold shadow-sm">
                    {textFormButton}
                </button>
            </div>

        </form>
    );
};

export default MontaForm;