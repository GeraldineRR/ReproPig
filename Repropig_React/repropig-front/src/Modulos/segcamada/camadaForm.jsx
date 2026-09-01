import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const SegcamadaForm = ({ hideModal, segcamadaEdit, reload }) => {
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
    const [Id_Medicamento, setIdMedicamento] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [Id_Responsable, setIdResponsable] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [Observaciones, setObservaciones] = useState('');
    const [Fecha_Programada, setFechaProgramada] = useState('');
    const [textFormButton, setTextFormButton] = useState('Enviar');

    const diasSeguimiento = [1, 3, 5, 7, 10, 14, 21, 28];

    // Calcula fecha programada según día y fecha del parto
    function calcularFechaProgramada(fechaParto, dia) {
        const [year, month, day] = fechaParto.split('-');
        const fecha = new Date(year, month - 1, parseInt(day) + (dia - 1));
        return fecha.toISOString().split('T')[0];
    }

    // Obtiene el siguiente día programado basado en registros existentes para el porcino
    const actualizarDiaYFecha = async (idPorcino) => {
        if (!Id_parto || !idPorcino) return;

        try {
            const response = await apiAxios.get(`/segcamada/porcino/${idPorcino}`);
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
    useEffect(() => { if (Id_parto) getCriasPorParto(Id_parto) }, [Id_parto]);
    useEffect(() => { getMedicamentos(); getResponsables(); }, []);

    useEffect(() => {
        if (!segcamadaEdit || modoCorreccion) {
            if (Id_Porcino && Id_parto) {
                actualizarDiaYFecha(Id_Porcino);
            }
        }
    }, [Id_Porcino, Id_parto, partos, modoCorreccion]);

    const getPartos = async () => {
        try {
            const response = await apiAxios.get('/partos/');
            setPartos(response.data);
        } catch (error) { console.error("Error cargando partos:", error); }
    }

    const getLechonesPorParto = async (idParto) => {
        try {
            // Traemos los porcinos de tipo Lechon asociados al parto
            const response = await apiAxios.get(`/porcino/lechones/parto/${idParto}`);
            setLechones(response.data);
        } catch (error) {
            console.error("Error cargando lechones:", error);
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

    const parsearMultiples = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === 'string' && val.startsWith('[')) {
            try { return JSON.parse(val).map(String); } catch { return []; }
        }
        return [String(val)];
    };

    useEffect(() => {
        if (segcamadaEdit) {
            console.log("EDIT DATA:", segcamadaEdit);

            setIdParto(segcamadaEdit.porcino?.Id_parto ?? '');
            setPartoConfirmado(true);
            setIdPorcino(segcamadaEdit.Id_Porcino ?? '');
            setDiaProgramado(segcamadaEdit.Dia_Programado ?? '');

            const parto = partos.find(
                p => p.Id_parto === Number(segcamadaEdit.porcino?.Id_parto)
            );

            if (parto?.Fec_fin && segcamadaEdit.Dia_Programado) {
                const fechaProg = calcularFechaProgramada(
                    parto.Fec_fin,
                    segcamadaEdit.Dia_Programado
                );
                setFechaProgramada(fechaProg);
            }

            setFechaReal(segcamadaEdit.Fecha_Real?.split('T')[0] ?? '');
            setPesoCria(segcamadaEdit.Peso_Cria ?? '');
            setIdMedicamento(parsearMultiples(segcamadaEdit.Id_Medicamento));
            setIdResponsable(parsearMultiples(segcamadaEdit.Id_Responsable));
            setObservaciones(segcamadaEdit.Observaciones ?? '');
            setTextFormButton("Actualizar");
        } else {
            resetForm();
        }
    }, [segcamadaEdit, partos]);

    const resetForm = () => {
        setIdPorcino('');
        setDiaProgramado('');
        setFechaReal('');
        setPesoCria('');
        setIdMedicamento([]);
        setIdResponsable([]);
        setObservaciones('');
        setTextFormButton("Enviar");
    }

    const huboCambios = () => {
        if (!segcamadaEdit) return true;
        return !(
            Number(Id_Porcino) === Number(segcamadaEdit.Id_Porcino) &&
            Number(Dia_Programado) === Number(segcamadaEdit.Dia_Programado) &&
            Fecha_Real === segcamadaEdit.Fecha_Real?.split('T')[0] &&
            parseFloat(Peso_Cria).toFixed(2) === parseFloat(segcamadaEdit.Peso_Cria).toFixed(2) &&
            Number(Id_Medicamento || 0) === Number(segcamadaEdit.Id_Medicamento || 0) &&
            Observaciones === (segcamadaEdit.Observaciones || '')
        );
    }

    const gestionarForm = async (e) => {
        e.preventDefault();

        const formatMultiField = (val) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null;
            if (Array.isArray(val)) {
                return val.length === 1 ? Number(val[0]) : JSON.stringify(val.map(Number));
            }
            return Number(val);
        };

        const data = {
            Id_Porcino,
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

                const result = await MySwal.fire({
                    title: 'Registro exitoso',
                    html: `¿Deseas registrar seguimiento de otro lechón de este parto?`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, registrar',
                    cancelButtonText: 'Terminar'
                });

                if (result.isConfirmed) resetForm();
                else {
                    resetForm();
                    setPartoConfirmado(false);
                    setIdParto('');
                    hideModal();
                }

            } else {
                if (!huboCambios()) {
                    MySwal.fire({
                        icon: "info",
                        title: "Sin cambios",
                        text: "No se realizaron cambios."
                    });
                    return;
                }

                await apiAxios.put(`/segcamada/${segcamadaEdit.Id_SegCamada}`, data);
                await reload();

                MySwal.fire({
                    title: 'Actualizado',
                    text: 'Seguimiento actualizado correctamente.',
                    icon: 'success'
                });
                hideModal();
            }

        } catch (error) {
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "No se pudo guardar el registro."
            });
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

    // Nombre del lechón seleccionado para mostrar en modo edición
    const lechoNombreEdicion = () => {
        const p = segcamadaEdit?.porcino;
        if (!p) return '';
        return `Lechón #${p.Id_Porcino}${p.Nom_Porcino ? ' - ' + p.Nom_Porcino : ''}`;
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            {/* PARTO */}
            <div className="mb-3">
                <label className="form-label">Parto</label>

                {segcamadaEdit && !modoCorreccion ? (
                    <input
                        type="text"
                        className="form-control"
                        value={`Parto #${Id_parto} - ${partos.find(p => p.Id_parto === Number(Id_parto))?.porcino?.Nom_Porcino || 'Sin nombre'} - ${partos.find(p => p.Id_parto === Number(Id_parto))?.Fec_fin || ''}`}
                        readOnly
                    />
                ) : (
                    <select
                        className="form-control"
                        value={Id_parto}
                        onChange={(e) => handleSelectParto(e.target.value)}
                        disabled={partoConfirmado && !modoCorreccion}
                        required
                    >
                        <option value="">Selecciona...</option>
                        {partos.map((parto) => (
                            <option key={parto.Id_parto} value={parto.Id_parto}>
                                Parto #{parto.Id_parto} - {parto.porcino?.Nom_Porcino || 'Sin nombre'} - {parto.Fec_fin}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* LECHÓN Y FORMULARIO */}
            {(Id_parto || segcamadaEdit) && (
                <>
                    <div className="mb-3">
                        <label className="form-label">Lechón</label>

                        {segcamadaEdit && !modoCorreccion ? (
                            <input
                                type="text"
                                className="form-control"
                                value={lechoNombreEdicion()}
                                readOnly
                            />
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
                                        Lechón #{lechon.Id_Porcino}{lechon.Nom_Porcino ? ` - ${lechon.Nom_Porcino}` : ''} ({lechon.Estado})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {segcamadaEdit && !modoCorreccion && (
                        <button
                            type="button"
                            className="btn btn-warning mb-3"
                            onClick={activarCorreccion}
                        >
                            Cambiar lechón / parto
                        </button>
                    )}

                    <div className="mb-3">
                        <label className="form-label">Día Programado</label>
                        <input
                            type="number"
                            className="form-control"
                            value={Dia_Programado}
                            readOnly
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Fecha Programada</label>
                        <input
                            type="date"
                            className="form-control"
                            value={Fecha_Programada}
                            readOnly
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Fecha Real</label>
                        <input
                            type="date"
                            className="form-control"
                            value={Fecha_Real}
                            onChange={(e) => setFechaReal(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Peso Lechón (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={Peso_Cria}
                            onChange={(e) => setPesoCria(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">👨‍🌾 Responsables (puedes elegir varios)</label>
                        <select
                            multiple
                            className="form-select shadow-sm"
                            style={{ height: '110px' }}
                            value={Array.isArray(Id_Responsable) ? Id_Responsable.map(String) : (Id_Responsable ? [String(Id_Responsable)] : [])}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setIdResponsable(selected);
                            }}
                        >
                            {responsables.map((resp) => (
                                <option key={resp.Id_Responsable} value={resp.Id_Responsable}>
                                    {resp.Nombres} {resp.Apellidos}
                                </option>
                            ))}
                        </select>
                        <small className="text-muted">Mantén presionada la tecla Ctrl (o Cmd) para seleccionar varias opciones.</small>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">💊 Medicamentos (puedes elegir varios)</label>
                        <select
                            multiple
                            className="form-select shadow-sm"
                            style={{ height: '110px' }}
                            value={Array.isArray(Id_Medicamento) ? Id_Medicamento.map(String) : (Id_Medicamento ? [String(Id_Medicamento)] : [])}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setIdMedicamento(selected);
                            }}
                        >
                            {medicamentos.map((med) => (
                                <option key={med.Id_Medicamento} value={med.Id_Medicamento}>
                                    {med.Nombre}
                                </option>
                            ))}
                        </select>
                        <small className="text-muted">Mantén presionada la tecla Ctrl (o Cmd) para seleccionar varias opciones.</small>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Observaciones</label>
                        <textarea
                            className="form-control"
                            value={Observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows="3"
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="submit"
                            className="btn btn-primary"
                            value={textFormButton}
                        />
                    </div>
                </>
            )}
        </form>
    );
}

export default SegcamadaForm;