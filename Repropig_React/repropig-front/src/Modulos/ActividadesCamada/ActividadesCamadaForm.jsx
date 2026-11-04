import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import apiAxios from "../../api/axiosConfig";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { calcularFechaProgramada } from "../../utils/dateUtils";

const ActividadesCamadaForm = ({ hideModal, actividadEdit, reload }) => {
    const MySwal = withReactContent(Swal);

    const [partoConfirmado, setPartoConfirmado] = useState(false);
    const [modoCorreccion, setModoCorreccion] = useState(false);
    const [Id_Porcino, setIdPorcino] = useState('');
    const [lechones, setLechones] = useState([]);
    const [Id_parto, setIdParto] = useState('');
    const [partos, setPartos] = useState([]);
    const [Dia_Programado, setDiaProgramado] = useState(0);
    const [Fecha_Real, setFechaReal] = useState('');
    const [Peso_Cria, setPesoCria] = useState('');
    const [Id_Tipo, setIdTipo] = useState('');
    const [tiposActividad, setTiposActividad] = useState([]);
    const [Id_Medicamento, setIdMedicamento] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [Id_Responsable, setIdResponsable] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [showResponsables, setShowResponsables] = useState(false);
    const [showMedicamentos, setShowMedicamentos] = useState(false);
    const responsablesRef = useRef(null);
    const medicamentosRef = useRef(null);
    const [Observaciones, setObservaciones] = useState('');
    const [Fecha_Programada, setFechaProgramada] = useState('');
    const [textFormButton, setTextFormButton] = useState('Enviar');
    const { id: partoIdParams } = useParams();

    const diasSeguimiento = [1, 3, 5, 7, 10, 14, 21, 28];

    const actualizarDiaYFecha = async (idPorcino) => {
        if (!Id_parto || !idPorcino) return;

        try {
            // Buscar seguimientos anteriores de este lechón
            const response = await apiAxios.get(`/segcamada/porcino/${idPorcino}`);

            const registros = Array.isArray(response.data)
                ? response.data
                : [];

            // Obtener el día más alto registrado
            const ultimoDia = registros.length
                ? Math.max(
                    ...registros.map(r => Number(r.Dia_Programado) || 0)
                )
                : 0;

            // Buscar el siguiente día disponible
            const nextDay = diasSeguimiento.find(
                dia => dia > ultimoDia
            );

            // Si ya llegó al día 28
            if (!nextDay) {
                setDiaProgramado(28);
            } else {
                setDiaProgramado(nextDay);
            }

            const diaCalculado = nextDay || 28;

            // Buscar el parto sin importar si el ID viene como string o número
            const partoSeleccionado = partos.find(
                p => String(p.Id_parto) === String(Id_parto)
            );

            if (!partoSeleccionado) {
                console.warn(
                    "No se encontró el parto seleccionado:",
                    Id_parto
                );
                return;
            }

            // Priorizar la fecha de nacimiento del lechón si existe; de lo contrario Fec_fin o Fec_inicio del parto
            const lechonSeleccionado = lechones.find(
                l => String(l.Id_Porcino) === String(idPorcino)
            );
            const fechaBase = lechonSeleccionado?.Fec_Nac_Porcino || partoSeleccionado.Fec_fin || partoSeleccionado.Fec_inicio;

            if (!fechaBase) {
                console.warn(
                    "El parto/lechón no tiene fecha base:",
                    partoSeleccionado
                );
                return;
            }

            // Calcular fecha programada sin desfase horario
            const fechaProg = calcularFechaProgramada(
                fechaBase,
                diaCalculado
            );

            if (fechaProg) {
                setFechaProgramada(fechaProg);

                // La fecha real comienza con la fecha programada
                setFechaReal(fechaProg);
            }

        } catch (error) {
            console.error(
                "Error obteniendo registros previos:",
                error
            );
        }
    };

    useEffect(() => { getPartos() }, []);
    useEffect(() => { if (Id_parto) getLechonesPorParto(Id_parto) }, [Id_parto]);
    useEffect(() => { getMedicamentos(); getResponsables(); getTiposActividad(); }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (responsablesRef.current && !responsablesRef.current.contains(event.target)) {
                setShowResponsables(false);
            }
            if (medicamentosRef.current && !medicamentosRef.current.contains(event.target)) {
                setShowMedicamentos(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (
            Id_Porcino &&
            Id_parto &&
            (!actividadEdit || modoCorreccion)
        ) {
            actualizarDiaYFecha(Id_Porcino);
        }
    }, [
        Id_Porcino,
        Id_parto,
        partos,
        lechones,
        modoCorreccion
    ]);

    const getPartos = async () => {
        try {
            const response = await apiAxios.get('/partos/');
            setPartos(response.data);
        } catch (error) { console.error("Error cargando partos:", error); }
    }

    const getLechonesPorParto = async (idParto) => {
        try {
            const response = await apiAxios.get(
                `/porcino/lechones/parto/${idParto}`
            );

            const rawList = Array.isArray(response.data) ? response.data : [];
            const permitidos = rawList.filter(p => 
                (p.Estado || '').trim().toLowerCase() === 'activo' ||
                (actividadEdit && String(p.Id_Porcino) === String(actividadEdit.Id_Porcino))
            );

            setLechones(permitidos);

        } catch (error) {
            console.error(
                "Error cargando lechones:",
                error
            );

            setLechones([]);
        }
    }

    const getMedicamentos = async () => {
        try {
            const response = await apiAxios.get('/medicamentos/');
            setMedicamentos(response.data);
        } catch (error) { console.error("Error cargando medicamentos:", error); }
    }

    const getResponsables = async () => {
        try {
            const response = await apiAxios.get('/responsables/');
            setResponsables(response.data);
        } catch (error) { console.error("Error cargando responsables:", error); }
    }

    const getTiposActividad = async () => {
        try {
            const response = await apiAxios.get('/tipos_actividad/');
            const rawList = Array.isArray(response.data) ? response.data : [];
            const permitidos = rawList.filter(t =>
                (t.Estado || '').trim().toLowerCase() === 'activo' ||
                (actividadEdit && String(t.Id_Tipo) === String(actividadEdit.Id_Tipo))
            );
            setTiposActividad(permitidos);
        } catch (error) {
            console.error("Error cargando tipos de actividad:", error);
            setTiposActividad([]);
        }
    }

    const toggleResponsable = (id) => {
        setIdResponsable(prev => {
            const idStr = String(id);
            const actual = (Array.isArray(prev) ? prev : []).map(String);
            return actual.includes(idStr) ? actual.filter(r => r !== idStr) : [...actual, idStr];
        });
    };

    const toggleMedicamento = (id) => {
        setIdMedicamento(prev => {
            const idStr = String(id);
            const actual = (Array.isArray(prev) ? prev : []).map(String);
            return actual.includes(idStr) ? actual.filter(m => m !== idStr) : [...actual, idStr];
        });
    };

    const parsearMultiples = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === 'string' && val.startsWith('[')) {
            try { return JSON.parse(val).map(String); } catch { return []; }
        }
        return [String(val)];
    };

    useEffect(() => {
        if (actividadEdit) {
            setIdParto(actividadEdit.porcino?.Id_parto ?? '');
            setPartoConfirmado(true);
            setIdPorcino(actividadEdit.Id_Porcino ?? '');
            setIdTipo(actividadEdit.Id_Tipo ?? '');
            setDiaProgramado(actividadEdit.Dia_Programado ?? '');

            const parto = partos.find(p => p.Id_parto === Number(actividadEdit.porcino?.Id_parto));
            const lechon = lechones.find(l => String(l.Id_Porcino) === String(actividadEdit.Id_Porcino));
            const fechaBase = lechon?.Fec_Nac_Porcino || actividadEdit.porcino?.Fec_Nac_Porcino || parto?.Fec_fin || parto?.Fec_inicio;
            if (fechaBase && actividadEdit.Dia_Programado) {
                const fechaProg = calcularFechaProgramada(fechaBase, actividadEdit.Dia_Programado);
                setFechaProgramada(fechaProg);
            }

            setFechaReal(actividadEdit.Fecha_Real?.split('T')[0] ?? '');
            setPesoCria(actividadEdit.Peso_Cria ?? '');
            setIdMedicamento(parsearMultiples(actividadEdit.Id_Medicamento));
            setIdResponsable(parsearMultiples(actividadEdit.Id_Responsable));
            setObservaciones(actividadEdit.Observaciones ?? '');
            setTextFormButton("Actualizar");
        } else {
            resetForm();
            if (partoIdParams) {
                setIdParto(partoIdParams);
                setPartoConfirmado(true);
            }
        }
    }, [actividadEdit, partos, partoIdParams]);

    const resetForm = () => {
        setIdPorcino('');
        setIdTipo('');
        setDiaProgramado('');
        setFechaReal('');
        setPesoCria('');
        setIdMedicamento([]);
        setIdResponsable([]);
        setShowResponsables(false);
        setShowMedicamentos(false);
        setObservaciones('');
        setTextFormButton("Enviar");
    }

    const huboCambios = () => {
        if (!actividadEdit) return true;
        const currentMeds = (Array.isArray(Id_Medicamento) ? Id_Medicamento : []).map(String).sort().join(',');
        const editMeds = parsearMultiples(actividadEdit.Id_Medicamento).sort().join(',');
        const currentResps = (Array.isArray(Id_Responsable) ? Id_Responsable : []).map(String).sort().join(',');
        const editResps = parsearMultiples(actividadEdit.Id_Responsable).sort().join(',');

        return !(
            Number(Id_Porcino) === Number(actividadEdit.Id_Porcino) &&
            Number(Id_Tipo || 0) === Number(actividadEdit.Id_Tipo || 0) &&
            Number(Dia_Programado) === Number(actividadEdit.Dia_Programado) &&
            Fecha_Real === actividadEdit.Fecha_Real?.split('T')[0] &&
            Number(Peso_Cria) === Number(actividadEdit.Peso_Cria) &&
            currentMeds === editMeds &&
            currentResps === editResps &&
            Observaciones === (actividadEdit.Observaciones || '')
        );
    }

    const verificarPesoCero = async () => {
        if (Number(Peso_Cria) === 0) {
            const result = await MySwal.fire({
                icon: 'warning',
                title: 'Peso igual a 0',
                html: `<p>Has ingresado un peso de <strong>0 kg</strong> para este lechón.</p>
                       <p><strong>Peso 0 indica posible muerte o problema grave.</strong></p>
                       <p>¿Deseas registrar una novedad automáticamente?</p>`,
                showCancelButton: true,
                confirmButtonText: 'Sí, registrar novedad',
                cancelButtonText: 'No, solo guardar',
                reverseButtons: true,
                focusCancel: true
            });

            if (result.isConfirmed) {
                try {
                    await apiAxios.post('/novedades/', {
                        Tipo_Novedad: 'Muerte',
                        Fecha_Novedad: Fecha_Real || new Date().toISOString().split('T')[0],
                        Causa_Motivo: 'Registrado por peso 0 en seguimiento de camada',
                        Id_Porcino: Id_Porcino
                    });
                    // Marcar el porcino como Muerto
                    await apiAxios.put(`/porcino/${Id_Porcino}`, { Estado: 'Muerto' });
                } catch (error) {
                    console.error("Error registrando novedad automática:", error);
                    MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la novedad de muerte.' });
                    return 'error';
                }
                return 'muerto';
            }
        }
        return 'ok';
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        const resultadoPeso = await verificarPesoCero();
        if (resultadoPeso === 'error') return;

        const formatMultiField = (val) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null;
            if (Array.isArray(val)) {
                return val.length === 1 ? Number(val[0]) : JSON.stringify(val.map(Number));
            }
            return Number(val);
        };

        const data = {
            Id_Porcino,
            Id_Tipo: Id_Tipo ? Number(Id_Tipo) : null,
            Dia_Programado,
            Fecha_Real,
            Peso_Cria,
            Id_Medicamento: formatMultiField(Id_Medicamento),
            Id_Responsable: formatMultiField(Id_Responsable),
            Observaciones
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/segcamada/', data);
                await reload();

                if (resultadoPeso === 'muerto') {
                    if (Id_parto) await getLechonesPorParto(Id_parto);
                    await MySwal.fire({
                        title: 'Registro guardado',
                        html: `El seguimiento fue guardado y se registró la novedad de <strong>Muerte</strong> automáticamente.`,
                        icon: 'info',
                        confirmButtonText: 'Entendido'
                    });
                    resetForm();
                    setPartoConfirmado(false);
                    setIdParto('');
                    hideModal();
                    return;
                }

                const result = await MySwal.fire({
                    title: 'Registro exitoso',
                    html: `¿Deseas registrar otro lechón de este parto?`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, registrar',
                    cancelButtonText: 'Terminar'
                });

                if (result.isConfirmed) resetForm();
                else {
                    resetForm();
                    if (!partoIdParams) {
                        setPartoConfirmado(false);
                        setIdParto('');
                    }
                    hideModal();
                }

            } else {
                try {
                    const res = await apiAxios.get(`/segcamada/cria/${Id_Porcino}`);
                    const registros = res.data;
                    const hasNewer = registros.some(item => item.Dia_Programado > actividadEdit.Dia_Programado);
                    if (hasNewer) {
                        MySwal.fire({
                            icon: "error",
                            title: "Operación no permitida",
                            text: "No se puede editar porque ya existe un seguimiento posterior para este lechón."
                        });
                        hideModal();
                        return;
                    }
                } catch (err) {
                    console.error("Error validando seguimientos posteriores:", err);
                }

                if (!huboCambios()) {
                    MySwal.fire({ icon: "info", title: "Sin cambios", text: "No se realizaron cambios." });
                    return;
                }

                await apiAxios.put(`/segcamada/${actividadEdit.Id_SegCamada}`, data);
                await reload();

                if (resultadoPeso === 'muerto') {
                    if (Id_parto) await getLechonesPorParto(Id_parto);
                    MySwal.fire({
                        title: 'Actualizado',
                        html: 'Seguimiento actualizado y se registró la novedad de <strong>Muerte</strong> automáticamente.',
                        icon: 'info'
                    });
                } else {
                    MySwal.fire({ title: 'Actualizado', text: 'Seguimiento actualizado correctamente.', icon: 'success' });
                }
                hideModal();
            }

        } catch (error) {
            MySwal.fire({ icon: "error", title: "Error", text: "No se pudo guardar el registro." });
        }
    }

    const handleSelectParto = async (id) => {
        if (!id) return;
        const result = await MySwal.fire({
            title: "¿Confirmar parto?",
            text: `¿Seguro que deseas trabajar con el parto #${id}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "Cancelar"
        });
        if (result.isConfirmed) {
            setIdParto(id);
            setPartoConfirmado(true);
        }
    }

    const activarCorreccion = async () => {
        const result = await MySwal.fire({
            icon: "warning",
            title: "Cambiar lechón o parto",
            text: "Se reiniciará el cálculo del seguimiento actual.",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "Cancelar"
        });
        if (result.isConfirmed) {
            setModoCorreccion(true);
            setPartoConfirmado(false);
            setIdPorcino('');
            setDiaProgramado('');
            setFechaProgramada('');
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            {/* PARTO */}
            {actividadEdit && !modoCorreccion ? (
                <>
                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label">Parto</label>
                            <input
                                type="text"
                                className="form-control"
                                style={{ backgroundColor: "#E3E3E3" }}
                                value={`Parto # ${Id_parto} - ${partos.find(p => p.Id_parto === Number(Id_parto))?.porcino?.Nom_Porcino || 'Sin nombre'} - ${partos.find(p => p.Id_parto === Number(Id_parto))?.Fec_fin?.split('T')[0] || ''}`}
                                readOnly
                            />
                        </div>
                        <div className="col-6">
                            <label className="form-label">Día Programado</label>
                            <input
                                type="text"
                                className="form-control py-2"
                                style={{ backgroundColor: "#d1ecf1" }}
                                value={`N° ${Dia_Programado}`}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label">Lechón</label>
                            <input
                                type="text"
                                className="form-control"
                                style={{ backgroundColor: "#E3E3E3" }}
                                value={actividadEdit.porcino?.Nom_Porcino || `Lechón #${Id_Porcino}`}
                                readOnly
                            />
                        </div>
                        <div className="col-6">
                            <label className="form-label">Fecha Programada</label>
                            <input
                                type="date"
                                className="form-control"
                                style={{ backgroundColor: "#d1ecf1" }}
                                value={Fecha_Programada}
                                readOnly
                            />
                        </div>
                    </div>

                    <button type="button" className="btn btn-warning mb-3" onClick={activarCorreccion}>
                        Cambiar lechón / parto
                    </button>
                </>
            ) : (
                <div className="mb-3">
                    <label className="form-label">Parto</label>
                    <select
                        className="form-control"
                        value={Id_parto}
                        onChange={(e) => handleSelectParto(e.target.value)}
                        disabled={(partoConfirmado && !modoCorreccion) || (!!partoIdParams && !actividadEdit)}
                        required
                    >
                        <option value="">Selecciona...</option>
                        {partos.map((parto) => (
                            <option key={parto.Id_parto} value={parto.Id_parto}>
                                Parto #{parto.Id_parto} - {parto.porcino?.Nom_Porcino || 'Sin nombre'} - {parto.Fec_fin?.split('T')[0] || ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* LECHÓN — solo en modo creación/corrección */}
            {(!actividadEdit || modoCorreccion) ? (
                (Id_parto || actividadEdit) && (
                    <>
                        <div className="mb-3">
                            <label className="form-label">Lechón</label>
                            {lechones.length === 0 ? (
                                <div className="alert alert-info mb-0">
                                    <i className="bi bi-info-circle"></i>
                                    {' '}No hay lechones disponibles para este parto. Registra primero los lechones en el módulo de Porcinos.
                                </div>
                            ) : (
                                <select
                                    className="form-control"
                                    value={Id_Porcino}
                                    onChange={(e) => setIdPorcino(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona...</option>
                                    {lechones.map((lechon) => (
                                        <option key={lechon.Id_Porcino} value={lechon.Id_Porcino}>
                                            {lechon.Nom_Porcino || `Lechón #${lechon.Id_Porcino}`} — Chapeta {lechon.Num_Chapeta || 'S/N'}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {Id_Porcino && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Día Programado</label>
                                    <input
                                        type="text"
                                        className="form-control py-2"
                                        style={{ backgroundColor: "#d1ecf1" }}
                                        value={`N° ${Dia_Programado}`}
                                        readOnly
                                    />
                                    <small className="text-muted">
                                        Calculado automáticamente según registros previos.
                                    </small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fecha Programada</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        style={{ backgroundColor: "#d1ecf1" }}
                                        value={Fecha_Programada}
                                        readOnly
                                    />
                                    <small className="text-muted">
                                        Fecha según la fecha de cierre del parto.
                                    </small>
                                </div>
                            </>
                        )}
                    </>
                )
            ) : null}

            {/* CAMPOS COMUNES */}
            {(Id_parto || actividadEdit) && (actividadEdit && !modoCorreccion || lechones.length > 0) && (
                <>
                    <div className="mb-3">
                        <label className="form-label">Fecha Real</label>
                        <input type="date" className="form-control" value={Fecha_Real} onChange={(e) => setFechaReal(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Peso Lechón (kg)</label>
                        <input type="number" step="0.01" className="form-control" value={Peso_Cria} onChange={(e) => setPesoCria(e.target.value)} required />
                    </div>

                    {/* RESPONSABLES DROPDOWN */}
                    <div className="mb-3 position-relative" ref={responsablesRef}>
                        <label className="form-label fw-semibold">
                            👨‍🌾 Responsables ({Id_Responsable.length})
                        </label>
                        <div 
                            className="form-control shadow-sm d-flex justify-content-between align-items-center"
                            onClick={() => setShowResponsables(!showResponsables)}
                            style={{ cursor: "pointer", userSelect: "none", backgroundColor: "#fff" }}
                        >
                            <span>
                                {Id_Responsable.length === 0 ? "Seleccionar responsables..." : `${Id_Responsable.length} seleccionados`}
                            </span>
                            <span className="text-muted small">▼</span>
                        </div>
                        {showResponsables && (
                            <ul className="dropdown-menu show w-100 shadow-sm border-0 border-top-0 rounded-bottom" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                                {responsables.length === 0 ? (
                                    <li className="dropdown-item text-muted small">No hay responsables registrados</li>
                                ) : (
                                    responsables.filter(r => r.Estado === 'Activo' || Id_Responsable.map(String).includes(String(r.Id_Responsable))).map(r => {
                                        const activo = Id_Responsable.map(String).includes(String(r.Id_Responsable));
                                        return (
                                            <li key={r.Id_Responsable} onClick={(e) => { e.stopPropagation(); toggleResponsable(r.Id_Responsable); }}>
                                                <a className="dropdown-item d-flex align-items-center gap-2" href="#" onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="form-check-input m-0" 
                                                        checked={activo}
                                                        readOnly
                                                    />
                                                    {r.Nombres} {r.Apellidos || ''}
                                                </a>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        )}
                    </div>

                    {/* TIPO DE ACTIVIDAD (arriba de Medicamentos) */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            🏷️ Tipo de Actividad
                        </label>
                        <select
                            className="form-select shadow-sm"
                            value={Id_Tipo}
                            onChange={(e) => setIdTipo(e.target.value)}
                        >
                            <option value="">Selecciona tipo de actividad...</option>
                            {tiposActividad.map((tipo) => (
                                <option key={tipo.Id_Tipo} value={tipo.Id_Tipo}>
                                    {tipo.Nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* MEDICAMENTOS DROPDOWN */}
                    <div className="mb-3 position-relative" ref={medicamentosRef}>
                        <label className="form-label fw-semibold">
                            💊 Medicamentos ({Id_Medicamento.length})
                        </label>
                        <div 
                            className="form-control shadow-sm d-flex justify-content-between align-items-center"
                            onClick={() => setShowMedicamentos(!showMedicamentos)}
                            style={{ cursor: "pointer", userSelect: "none", backgroundColor: "#fff" }}
                        >
                            <span>
                                {Id_Medicamento.length === 0 ? "Seleccionar medicamentos..." : `${Id_Medicamento.length} seleccionados`}
                            </span>
                            <span className="text-muted small">▼</span>
                        </div>
                        {showMedicamentos && (
                            <ul className="dropdown-menu show w-100 shadow-sm border-0 border-top-0 rounded-bottom" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                                {medicamentos.length === 0 ? (
                                    <li className="dropdown-item text-muted small">No hay medicamentos registrados</li>
                                ) : (
                                    medicamentos.filter(m => (m.Estado || '').trim().toLowerCase() === 'activo' || Id_Medicamento.map(String).includes(String(m.Id_Medicamento))).map(m => {
                                        const activo = Id_Medicamento.map(String).includes(String(m.Id_Medicamento));
                                        return (
                                            <li key={m.Id_Medicamento} onClick={(e) => { e.stopPropagation(); toggleMedicamento(m.Id_Medicamento); }}>
                                                <a className="dropdown-item d-flex align-items-center gap-2" href="#" onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="form-check-input m-0" 
                                                        checked={activo}
                                                        readOnly
                                                    />
                                                    {m.Nombre}
                                                </a>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        )}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Observaciones</label>
                        <textarea className="form-control" value={Observaciones} onChange={(e) => setObservaciones(e.target.value)} rows="3" />
                    </div>
                    <div className="mb-3">
                        <input type="submit" className="btn btn-primary" value={textFormButton} />
                    </div>
                </>
            )}
        </form>
    );
}

export default ActividadesCamadaForm;
