import { useEffect, useState } from "react";
import apiAxios from "../../api/axiosConfig.js";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

// ✅ Acepta onColectaCreada para flujo encadenado desde reproducciones
const ColectaForm = ({ hideModal, rowToEdit = {}, refreshTable, onColectaCreada }) => {
    const MySwal = WithReactContent(Swal)

    const [Fecha, setFecha] = useState('');
    const [Uso_colecta, setUso_colecta] = useState('');
    const [Tipo, setTipo] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [Id_Responsable, setId_Responsable] = useState([]);
    const [volumen, setVolumen] = useState('');
    const [color, setColor] = useState('');
    const [olor, setOlor] = useState('');
    const [cant_generada, setCant_generada] = useState('');
    const [cant_utilizada, setCant_utilizada] = useState('');
    const [Observaciones, setObservaciones] = useState('');
    const [porcinos, setPorcinos] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Agregar Colecta');

    useEffect(() => {
        getPorcinos()
        getResponsables()
    }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino')
            setPorcinos(response.data.filter(p => p.Gen_Porcino === 'M'))
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
        if (rowToEdit.Id_colecta) {
            setFecha(rowToEdit.Fecha?.split('T')[0] || '')
            setUso_colecta(rowToEdit.Uso_colecta)
            setTipo(rowToEdit.Tipo)
            setId_Porcino(rowToEdit.Id_Porcino)
            setId_Responsable(parsearResponsables(rowToEdit.Id_Responsable))
            setVolumen(rowToEdit.volumen)
            setColor(rowToEdit.color)
            setOlor(rowToEdit.olor)
            setCant_generada(rowToEdit.cant_generada)
            setCant_utilizada(rowToEdit.cant_utilizada)
            setObservaciones(rowToEdit.Observaciones)
            setTextFormButton('Actualizar Colecta')
        } else {
            setFecha(''); setUso_colecta(''); setTipo(''); setId_Porcino('')
            setId_Responsable([]); setVolumen(''); setColor(''); setOlor('')
            setCant_generada(''); setCant_utilizada(''); setObservaciones('')
            setTextFormButton('Agregar Colecta')
        }
    }, [rowToEdit.Id_colecta]);

    const toggleResponsable = (id) => {
        setId_Responsable(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        )
    }

    const mostrarTodo = Uso_colecta === 'Si';
    const esInterno = Tipo === 'Interno';

    const gestionarForm = async (e) => {
        e.preventDefault();

        if (mostrarTodo && Id_Responsable.length === 0) {
            MySwal.fire({ icon: 'warning', title: 'Requerido', text: 'Debes seleccionar al menos un responsable' })
            return
        }

        const formData = {
            Fecha,
            Uso_colecta,
            Tipo,
            Id_Porcino: esInterno ? Id_Porcino : null,
            Id_Responsable: mostrarTodo ? JSON.stringify(Id_Responsable) : null,
            volumen: mostrarTodo ? (parseFloat(volumen) || 0) : null,
            color: mostrarTodo ? color : null,
            olor: mostrarTodo ? olor : null,
            cant_generada: mostrarTodo ? (parseFloat(cant_generada) || 0) : null,
            cant_utilizada: mostrarTodo ? (parseFloat(cant_utilizada) || 0) : null,
            Observaciones
        };

        try {
            if (textFormButton === 'Agregar Colecta') {
                const response = await apiAxios.post('/colectas', formData)
                MySwal.fire({ title: "Registro exitoso", text: "Colecta creada con éxito", icon: "success" })

                // ✅ Si viene del flujo encadenado, llamar callback con el Id_colecta creado
                if (onColectaCreada) {
                    const Id_colecta = response.data.colecta?.Id_colecta
                    onColectaCreada(Id_colecta)
                } else {
                    hideModal()
                    refreshTable()
                }
            } else {
                await apiAxios.put('/colectas/' + rowToEdit.Id_colecta, formData)
                MySwal.fire({ title: "Actualización exitosa", text: "Colecta actualizada con éxito", icon: "success" })
                hideModal()
                refreshTable()
            }
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
        }
    };

    return (
        <form onSubmit={gestionarForm} className="w-100">

            {/* HEADER */}
            <div className="text-center mb-4">
                <h5 className="fw-bold">🧫 Registro de Colecta</h5>
                <small className="text-muted">Control de muestras reproductivas</small>
            </div>

            {onColectaCreada && (
                <div className="alert alert-success py-2 text-center">
                    Guarda la colecta y continuarás con inseminación
                </div>
            )}

            <div className="row g-3">

                {/* FECHA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha</label>
                    <input
                        type="date"
                        className="form-control shadow-sm"
                        value={Fecha}
                        onChange={e => setFecha(e.target.value)}
                        required
                    />
                </div>

                {/* USO */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">⚙️ Uso</label>
                    <select
                        className="form-select shadow-sm"
                        value={Uso_colecta}
                        onChange={e => {
                            setUso_colecta(e.target.value)
                            if (e.target.value === 'No') {
                                setTipo(''); setId_Porcino(''); setId_Responsable([])
                                setVolumen(''); setColor(''); setOlor('')
                                setCant_generada(''); setCant_utilizada('')
                            }
                        }}
                        required
                    >
                        <option value="">Seleccione</option>
                        <option value="Si">Sí</option>
                        <option value="No">No</option>
                    </select>
                </div>

            </div>

            {mostrarTodo && (
                <>
                    <div className="row g-3 mt-1">

                        {/* TIPO */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">📌 Tipo</label>
                            <select
                                className="form-select shadow-sm"
                                value={Tipo}
                                onChange={e => { setTipo(e.target.value); setId_Porcino('') }}
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="Interno">Interno</option>
                                <option value="Externo">Externo</option>
                            </select>
                        </div>

                        {/* CERDO */}
                        {esInterno && (
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">🐗 Cerdo</label>
                                <select
                                    className="form-select shadow-sm"
                                    value={Id_Porcino}
                                    onChange={e => setId_Porcino(e.target.value)}
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
                        )}

                    </div>

                    {Tipo === 'Externo' && (
                        <div className="alert alert-info mt-3 py-2">
                            Colecta externa: proviene de fuera de la granja
                        </div>
                    )}

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
                                        style={{ cursor: "pointer", fontSize: "13px" }}
                                    >
                                        {r.Nombres}
                                    </span>
                                )
                            })}
                        </div>
                    </div>

                    {/* DATOS FÍSICOS */}
                    <div className="row g-3 mt-2">

                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Volumen</label>
                            <input
                                type="number"
                                className="form-control shadow-sm"
                                value={volumen}
                                onChange={e => setVolumen(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Color</label>
                            <input
                                type="text"
                                className="form-control shadow-sm"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Olor</label>
                            <input
                                type="text"
                                className="form-control shadow-sm"
                                value={olor}
                                onChange={e => setOlor(e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">
                                {Tipo === 'Externo' ? 'Pajillas compradas' : 'Pajillas generadas'}
                            </label>

                            <input
                                type="number"
                                className="form-control shadow-sm"
                                value={cant_generada}
                                onChange={e => setCant_generada(e.target.value)}
                                placeholder={Tipo === 'Externo'
                                    ? 'Ingrese cantidad comprada'
                                    : 'Ingrese cantidad generada'}
                            />

                            {Tipo === 'Externo' && (
                                <small className="text-muted">
                                    Estas pajillas fueron compradas externamente
                                </small>
                            )}
                        </div>

                    </div>
                </>
            )}

            {/* OBSERVACIONES */}
            {Uso_colecta && (
                <div className="mt-4">
                    <label className="form-label fw-semibold">📝 Observaciones</label>
                    <textarea
                        className="form-control shadow-sm"
                        rows="2"
                        value={Observaciones}
                        onChange={e => setObservaciones(e.target.value)}
                    />
                </div>
            )}

            {/* BOTÓN */}
            <div className="d-grid mt-4">
                <button className="btn btn-primary py-2 fw-semibold shadow-sm">
                    {textFormButton}
                </button>
            </div>

        </form>
    );
};

export default ColectaForm;