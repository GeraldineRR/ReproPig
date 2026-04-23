import { useEffect, useState, useRef } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";

const MontaForm = ({ hideModal, rowToEdit = {}, refreshTable, preloaded = {} }) => {

    const MySwal = WithReactContent(Swal);
    const navigate = useNavigate();

    const [Fec_hora, setFec_hora] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [Id_Cerdo, setId_Cerdo] = useState('');
    const [Id_Responsable, setId_Responsable] = useState([]);
    const [Observaciones, setObservaciones] = useState('');
    const [Id_Reproduccion, setId_Reproduccion] = useState('');
    const [hembras, setHembras] = useState([]);
    const [machos, setMachos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [reproduccionesActivas, setReproduccionesActivas] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Agregar Monta');

    useEffect(() => {
        getPorcinos();
        getResponsables();
    }, []);

    // ✅ ESTO ES LO QUE FALTABA — carga el preloaded cuando viene desde Reproducciones
    useEffect(() => {
        if (!preloaded?.Id_Porcino || !preloaded?.Id_Reproduccion) return;

        const cargarPreloaded = async () => {
            setId_Porcino(String(preloaded.Id_Porcino));

            const res = await apiAxios.get('/reproducciones');
            const activas = res.data.filter(r =>
                r.Id_Cerda == preloaded.Id_Porcino && r.Activo === 'Si'
            );
            setReproduccionesActivas(activas);

            setId_Reproduccion(String(preloaded.Id_Reproduccion));
        };

        cargarPreloaded();
    }, [preloaded?.Id_Porcino, preloaded?.Id_Reproduccion]);

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

    const getReproduccionesActivas = async (id) => {
        if (!id) return setReproduccionesActivas([]);
        const res = await apiAxios.get('/reproducciones');
        const activas = res.data.filter(r =>
            r.Id_Cerda == id && r.Activo === 'Si'
        );
        setReproduccionesActivas(activas);
    };

    const handlePorcinoChange = (e) => {
        const val = e.target.value;
        setId_Porcino(val);
        setId_Reproduccion('');
        getReproduccionesActivas(val);
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
            Id_Reproduccion
        };

        try {
            if (textFormButton === 'Agregar Monta') {
                await apiAxios.post('/monta/', data);
                MySwal.fire('OK', 'Monta creada', 'success');
            } else {
                await apiAxios.put('/monta/' + rowToEdit.Id_Monta, data);
                MySwal.fire('OK', 'Monta actualizada', 'success');
            }

            hideModal();
            refreshTable();

        } catch (err) {
            MySwal.fire('Error', err.message, 'error');
        }
    };

    const esPrellenado = !!preloaded.Id_Reproduccion;

    return (
        <form onSubmit={gestionarForm} className="w-100">

            <div className="text-center mb-4">
                <h5 className="fw-bold">🐷 Registrar Monta</h5>
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
                        required
                    />
                </div>

                {/* CERDA — bloqueada si viene prellenada */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🐷 Cerda</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Porcino}
                        onChange={handlePorcinoChange}
                        disabled={esPrellenado}
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

                {/* REPRODUCCION — bloqueada si viene prellenada */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🔁 Reproducción</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Reproduccion}
                        onChange={e => setId_Reproduccion(e.target.value)}
                        disabled={esPrellenado}
                        required
                    >
                        <option value="">Seleccione</option>
                        {reproduccionesActivas.map(r => (
                            <option key={r.Id_Reproduccion} value={r.Id_Reproduccion}>
                                #{r.Id_Reproduccion}
                            </option>
                        ))}
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