import { useState, useEffect } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const NovedadesForm = ({ hideModal, novedadEdit, reload }) => {
    const MySwal = withReactContent(Swal);

    const [Tipo_Novedad, setTipoNovedad] = useState('');
    const [Fecha_Novedad, setFechaNovedad] = useState('');
    const [Causa_Motivo, setCausaMotivo] = useState('');
    const [Observaciones, setObservaciones] = useState('');
    const [Id_Porcino, setIdPorcino] = useState('');
    const [porcinos, setPorcinos] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Guardar');

    const [muertosIds, setMuertosIds] = useState(new Set());

    useEffect(() => {
        getPorcinos();
    }, []);

    const getPorcinos = async () => {
        try {
            const [resPorcinos, resNovs] = await Promise.all([
                apiAxios.get('/porcino/'),
                apiAxios.get('/novedades/').catch(() => ({ data: [] }))
            ]);

            const listaPorcinos = Array.isArray(resPorcinos.data)
                ? resPorcinos.data
                : (resPorcinos.data?.data || []);

            const idMuertos = new Set();
            (resNovs.data || []).forEach(n => {
                if (n.Tipo_Novedad === 'Muerte') {
                    idMuertos.add(Number(n.Id_Porcino));
                }
            });
            listaPorcinos.forEach(p => {
                if ((p.Estado || '').trim().toLowerCase() === 'muerto') {
                    idMuertos.add(Number(p.Id_Porcino));
                }
            });

            setMuertosIds(idMuertos);
            setPorcinos(listaPorcinos);
        } catch (error) {
            console.error("Error cargando porcinos:", error);
            setPorcinos([]);
        }
    };

    useEffect(() => {
        if (novedadEdit) {
            setTipoNovedad(novedadEdit.Tipo_Novedad ?? '');
            setFechaNovedad(novedadEdit.Fecha_Novedad?.split('T')[0] ?? '');
            setCausaMotivo(novedadEdit.Causa_Motivo ?? '');
            setObservaciones(novedadEdit.Observaciones ?? '');
            setIdPorcino(novedadEdit.Id_Porcino ?? '');
            setTextFormButton("Actualizar");
        } else {
            resetForm();
        }
    }, [novedadEdit]);

    const resetForm = () => {
        setTipoNovedad('');
        setFechaNovedad(new Date().toISOString().split('T')[0]);
        setCausaMotivo('');
        setObservaciones('');
        setIdPorcino('');
        setTextFormButton("Guardar");
    };

    const huboCambios = () => {
        if (!novedadEdit) return true;
        return !(
            Tipo_Novedad === novedadEdit.Tipo_Novedad &&
            Fecha_Novedad === novedadEdit.Fecha_Novedad?.split('T')[0] &&
            Causa_Motivo === novedadEdit.Causa_Motivo &&
            Observaciones === novedadEdit.Observaciones &&
            Number(Id_Porcino) === Number(novedadEdit.Id_Porcino)
        );
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        if (Tipo_Novedad === 'Muerte' || Tipo_Novedad === 'Descarte') {
            const porcinoSel = porcinos.find(p => Number(p.Id_Porcino) === Number(Id_Porcino));

            try {
                const resNovs = await apiAxios.get('/novedades/');
                const existente = (resNovs.data || []).find(n =>
                    Number(n.Id_Porcino) === Number(Id_Porcino) &&
                    ['Muerte', 'Descarte'].includes(n.Tipo_Novedad) &&
                    (!novedadEdit || Number(n.Id_Novedad) !== Number(novedadEdit.Id_Novedad))
                );

                if (existente) {
                    MySwal.fire({
                        icon: 'warning',
                        title: 'Registro no permitido',
                        text: `El porcino #${Id_Porcino} ya cuenta con una novedad previa de ${existente.Tipo_Novedad}. No se pueden registrar muertes o descartes duplicados.`
                    });
                    return;
                }

                if (porcinoSel && (porcinoSel.Estado === 'Muerto' || porcinoSel.Estado === 'Inactivo') && !novedadEdit) {
                    MySwal.fire({
                        icon: 'warning',
                        title: 'Porcino no activo',
                        text: `El porcino #${Id_Porcino} ya se encuentra registrado como ${porcinoSel.Estado}. No se puede registrar muerte o descarte nuevamente.`
                    });
                    return;
                }
            } catch (err) {
                console.error("Error validando novedades duplicadas:", err);
            }
        }

        const data = {
            Tipo_Novedad,
            Fecha_Novedad,
            Causa_Motivo,
            Observaciones,
            Id_Porcino
        };

        try {
            if (textFormButton === 'Guardar') {
                await apiAxios.post('/novedades/', data);
                
                // Si la novedad es Muerte o Descarte, actualizar el estado del porcino
                if (Tipo_Novedad === 'Muerte' || Tipo_Novedad === 'Descarte') {
                    const nuevoEstado = Tipo_Novedad === 'Muerte' ? 'Muerto' : 'Inactivo';
                    await apiAxios.put(`/porcino/${Id_Porcino}`, { Estado: nuevoEstado });
                }

                await reload();
                MySwal.fire({
                    title: 'Guardado',
                    text: 'La novedad se registró correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                hideModal();
            } else {
                if (!huboCambios()) {
                    MySwal.fire({ icon: "info", title: "Sin cambios", text: "No se realizaron cambios." });
                    return;
                }
                
                await apiAxios.put(`/novedades/${novedadEdit.Id_Novedad}`, data);

                if (Tipo_Novedad === 'Muerte' || Tipo_Novedad === 'Descarte') {
                    const nuevoEstado = Tipo_Novedad === 'Muerte' ? 'Muerto' : 'Inactivo';
                    await apiAxios.put(`/porcino/${Id_Porcino}`, { Estado: nuevoEstado });
                }

                await reload();
                MySwal.fire({ title: 'Actualizado', text: 'Novedad actualizada correctamente.', icon: 'success' });
                resetForm();
                hideModal();
            }
        } catch (error) {
            console.error("Error guardando novedad:", error);
            const msg = error.response?.data?.message || "No se pudo guardar la novedad.";
            MySwal.fire({ icon: "error", title: "Error", text: msg });
        }
    };

    const [filtroTipo, setFiltroTipo] = useState('Todos');

    return (
        <form onSubmit={gestionarForm} className="col-12">
            
            <div className="text-center mb-4">
                <h5 className="fw-bold">⚠️ {novedadEdit ? 'Editar Novedad' : 'Registrar Novedad'}</h5>
                <small className="text-muted">Eventos y eventualidades</small>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold d-block">🔍 Filtrar lista de porcinos por:</label>
                <div className="btn-group mb-2 w-100" role="group">
                    <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={filtroTipo === 'Todos'} onChange={() => setFiltroTipo('Todos')} />
                    <label className="btn btn-outline-primary" htmlFor="btnradio1">Todos</label>

                    <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={filtroTipo === 'Adulto'} onChange={() => setFiltroTipo('Adulto')} />
                    <label className="btn btn-outline-primary" htmlFor="btnradio2">Solo Adultos</label>

                    <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" checked={filtroTipo === 'Lechon'} onChange={() => setFiltroTipo('Lechon')} />
                    <label className="btn btn-outline-primary" htmlFor="btnradio3">Solo Lechones</label>
                </div>
                
                <label className="form-label fw-semibold mt-2">🐷 Seleccionar Porcino</label>
                <select
                    className="form-control"
                    value={Id_Porcino}
                    onChange={(e) => setIdPorcino(e.target.value)}
                    required
                >
                    <option value="">Selecciona un porcino...</option>
                    {porcinos
                        .filter(p => {
                            const matchesTipo = filtroTipo === 'Todos' || p.Tipo_Cerdo === filtroTipo;
                            const esMuerto = muertosIds.has(Number(p.Id_Porcino)) || (p.Estado || '').trim().toLowerCase() === 'muerto';
                            const esElActual = novedadEdit && Number(p.Id_Porcino) === Number(novedadEdit.Id_Porcino);
                            return matchesTipo && (!esMuerto || esElActual);
                        })
                        .map((p) => {
                            const esInactivo = (p.Estado || '').toLowerCase() === 'inactivo';
                            return (
                                <option key={p.Id_Porcino} value={p.Id_Porcino}>
                                    {p.Nom_Porcino || `Porcino #${p.Id_Porcino}`} — Chapeta: {p.Num_Chapeta || 'S/N'} ({p.Tipo_Cerdo || 'No definido'}) {esInactivo ? `[Inactivo]` : ''}
                                </option>
                            );
                        })}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">📋 Tipo de Novedad</label>
                <select
                    className="form-control"
                    value={Tipo_Novedad}
                    onChange={(e) => setTipoNovedad(e.target.value)}
                    required
                >
                    <option value="">Selecciona...</option>
                    <option value="Muerte">Muerte</option>
                    <option value="Descarte">Descarte</option>
                    <option value="Enfermedad">Enfermedad</option>
                    <option value="Lesión">Lesión</option>
                    <option value="Ataque">Ataque/Pelea</option>
                    <option value="Traslado">Traslado</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">📅 Fecha de Novedad</label>
                <input
                    type="date"
                    className="form-control"
                    value={Fecha_Novedad}
                    onChange={(e) => setFechaNovedad(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">❓ Causa / Motivo</label>
                <input
                    type="text"
                    className="form-control"
                    value={Causa_Motivo}
                    onChange={(e) => setCausaMotivo(e.target.value)}
                    placeholder="Ej. Fractura de pata, fiebre..."
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">📝 Observaciones Adicionales</label>
                <textarea
                    className="form-control"
                    value={Observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows="3"
                />
            </div>

            <div className="d-flex gap-2 mb-3 mt-4">
                <button
                    type="button"
                    className="btn btn-outline-secondary w-50 fw-bold py-2 shadow-sm"
                    onClick={() => {
                        resetForm();
                        hideModal();
                    }}
                >
                    Cancelar
                </button>
                <input type="submit" className="btn btn-primary w-50 fw-bold py-2 shadow-sm" value={textFormButton} />
            </div>
        </form>
    );
};

export default NovedadesForm;
