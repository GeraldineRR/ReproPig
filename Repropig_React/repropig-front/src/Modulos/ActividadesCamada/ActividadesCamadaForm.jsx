import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiAxios from "../../api/axiosConfig";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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
    const [Id_Medicamento, setIdMedicamento] = useState('');
    const [medicamentos, setMedicamentos] = useState([]);
    const [Observaciones, setObservaciones] = useState('');
    const [Fecha_Programada, setFechaProgramada] = useState('');
    const [textFormButton, setTextFormButton] = useState('Enviar');
    const { id: partoIdParams } = useParams();

    const diasSeguimiento = [1, 3, 5, 7, 10, 14, 21, 28];

    function calcularFechaProgramada(fechaParto, dia) {
        const [year, month, day] = fechaParto.split('-');
        const fecha = new Date(year, month - 1, parseInt(day) + (dia - 1));
        return fecha.toISOString().split('T')[0];
    }

    const actualizarDiaYFecha = async (idPorcino) => {
        if (!Id_parto || !idPorcino) return;
        try {
            const response = await apiAxios.get(`/segcamada/cria/${idPorcino}`);
            const registros = response.data;
            const ultimoDia = registros.length ? registros[registros.length - 1].Dia_Programado : 0;
            const nextDay = diasSeguimiento.find(d => d > ultimoDia) || diasSeguimiento[diasSeguimiento.length - 1];
            setDiaProgramado(nextDay);
            const fechaParto = partos.find(p => p.Id_parto === Number(Id_parto))?.Fec_fin;
            if (fechaParto) {
                const fechaProg = calcularFechaProgramada(fechaParto, nextDay);
                setFechaProgramada(fechaProg);
                setFechaReal(fechaProg);
            }
        } catch (error) {
            console.error("Error obteniendo registros previos:", error);
        }
    }

    useEffect(() => { getPartos() }, []);
    useEffect(() => { if (Id_parto) getLechonesPorParto(Id_parto) }, [Id_parto]);
    useEffect(() => { getMedicamentos() }, []);

    useEffect(() => {
        if (!actividadEdit || modoCorreccion) {
            if (Id_Porcino && Id_parto) {
                actualizarDiaYFecha(Id_Porcino);
            }
        }
    }, [Id_Porcino, Id_parto, partos, modoCorreccion])

    const getPartos = async () => {
        try {
            const response = await apiAxios.get('/partos/');
            setPartos(response.data);
        } catch (error) { console.error("Error cargando partos:", error); }
    }

    const getLechonesPorParto = async (idParto) => {
        try {
            const response = await apiAxios.get(`/porcino/lechones/parto/${idParto}`);
            setLechones(response.data);
        } catch (error) { console.error("Error cargando lechones:", error); }
    }

    const getMedicamentos = async () => {
        try {
            const response = await apiAxios.get('/medicamentos/');
            setMedicamentos(response.data);
        } catch (error) { console.error("Error cargando medicamentos:", error); }
    }

    useEffect(() => {
        if (actividadEdit) {
            setIdParto(actividadEdit.porcino?.Id_parto ?? '');
            setPartoConfirmado(true);
            setIdPorcino(actividadEdit.Id_Porcino ?? '');
            setDiaProgramado(actividadEdit.Dia_Programado ?? '');

            const parto = partos.find(p => p.Id_parto === Number(actividadEdit.porcino?.Id_parto));
            if (parto?.Fec_fin && actividadEdit.Dia_Programado) {
                const fechaProg = calcularFechaProgramada(parto.Fec_fin, actividadEdit.Dia_Programado);
                setFechaProgramada(fechaProg);
            }

            setFechaReal(actividadEdit.Fecha_Real?.split('T')[0] ?? '');
            setPesoCria(actividadEdit.Peso_Cria ?? '');
            setIdMedicamento(actividadEdit.Id_Medicamento ?? '');
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
        setDiaProgramado('');
        setFechaReal('');
        setPesoCria('');
        setIdMedicamento('');
        setObservaciones('');
        setTextFormButton("Enviar");
    }

    const huboCambios = () => {
        if (!actividadEdit) return true;
        return !(
            Number(Id_Porcino) === Number(actividadEdit.Id_Porcino) &&
            Number(Dia_Programado) === Number(actividadEdit.Dia_Programado) &&
            Fecha_Real === actividadEdit.Fecha_Real?.split('T')[0] &&
            Number(Peso_Cria) === Number(actividadEdit.Peso_Cria) &&
            Number(Id_Medicamento || 0) === Number(actividadEdit.Id_Medicamento || 0) &&
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

        const data = {
            Id_Porcino,
            Dia_Programado,
            Fecha_Real,
            Peso_Cria,
            Id_Medicamento: Id_Medicamento || null,
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
                    <div className="mb-3">
                        <label className="form-label">Medicamento</label>
                        <select className="form-control" value={Id_Medicamento} onChange={(e) => setIdMedicamento(e.target.value)}>
                            <option value="">Sin medicamento</option>
                            {medicamentos.map((med) => (
                                <option key={med.Id_Medicamento} value={med.Id_Medicamento}>{med.Nombre}</option>
                            ))}
                        </select>
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
