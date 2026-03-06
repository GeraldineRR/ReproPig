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
        <form onSubmit={gestionarForm} className="col-12 col-md-8">

            {/* Indicador flujo encadenado */}
            {onColectaCreada && (
                <div className="alert alert-success py-2 mb-3">
                    <i className="fa-solid fa-circle-info me-2"></i>
                    Registra la colecta. Al guardar se abrirá el formulario de inseminación.
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">Fecha</label>
                <input type="date" className="form-control" value={Fecha}
                    onChange={e => setFecha(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label className="form-label">Uso colecta</label>
                <select className="form-select" value={Uso_colecta}
                    onChange={e => {
                        setUso_colecta(e.target.value)
                        if (e.target.value === 'No') {
                            setTipo(''); setId_Porcino(''); setId_Responsable([])
                            setVolumen(''); setColor(''); setOlor('')
                            setCant_generada(''); setCant_utilizada('')
                        }
                    }} required>
                    <option value="">Seleccione</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                </select>
            </div>

            {mostrarTodo && (
                <>
                    <div className="mb-3">
                        <label className="form-label">Tipo</label>
                        <select className="form-select" value={Tipo}
                            onChange={e => { setTipo(e.target.value); setId_Porcino('') }} required>
                            <option value="">Seleccione</option>
                            <option value="Interno">Interno</option>
                            <option value="Externo">Externo</option>
                        </select>
                    </div>

                    {esInterno && (
                        <div className="mb-3">
                            <label className="form-label">Cerda (Porcino)</label>
                            <select className="form-select" value={Id_Porcino}
                                onChange={e => setId_Porcino(e.target.value)} required>
                                <option value="">Seleccione un porcino</option>
                                {porcinos.map(p => (
                                    <option key={p.Id_Porcino} value={p.Id_Porcino}>{p.Nom_Porcino}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {Tipo === 'Externo' && (
                        <div className="alert alert-info py-2 mb-3">
                            <i className="fa-solid fa-circle-info me-2"></i>
                            Colecta externa: el porcino proviene de fuera de la granja.
                        </div>
                    )}

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
                                        id={`resp-col-${resp.Id_Responsable}`}
                                        checked={Id_Responsable.includes(resp.Id_Responsable)}
                                        onChange={() => toggleResponsable(resp.Id_Responsable)} />
                                    <label className="form-check-label" htmlFor={`resp-col-${resp.Id_Responsable}`}>
                                        {resp.Nombres} {resp.Apellidos}
                                        <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>{resp.Cargo}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Volumen</label>
                        <input type="number" step="0.01" className="form-control" value={volumen}
                            onChange={e => setVolumen(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Color</label>
                        <input type="text" className="form-control" value={color}
                            onChange={e => setColor(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Olor</label>
                        <input type="text" className="form-control" value={olor}
                            onChange={e => setOlor(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Cantidad Generada</label>
                        <input type="number" step="0.01" className="form-control" value={cant_generada}
                            onChange={e => setCant_generada(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Cantidad Utilizada</label>
                        <input type="number" step="0.01" className="form-control" value={cant_utilizada}
                            onChange={e => setCant_utilizada(e.target.value)} />
                    </div>
                </>
            )}

            {Uso_colecta && (
                <div className="mb-3">
                    <label className="form-label">Observaciones</label>
                    {Uso_colecta === 'No' && (
                        <small className="text-muted d-block mb-1">Esta colecta no será utilizada.</small>
                    )}
                    <textarea className="form-control" value={Observaciones}
                        onChange={e => setObservaciones(e.target.value)} />
                </div>
            )}

            <input type="submit" className="btn btn-primary w-50" value={textFormButton} />
        </form>
    );
};

export default ColectaForm;