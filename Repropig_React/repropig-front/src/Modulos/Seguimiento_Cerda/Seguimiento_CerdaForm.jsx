import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import SelectorResponsables from "../../components/SelectorResponsables.jsx"
import SelectorMedicamentos from "../../components/SelectorMedicamentos.jsx"

const Seguimiento_CerdaForm = ({ hideModal, Seguimiento_CerdaEdit, reload }) => {

    const MySwal = withReactContent(Swal)

    const [Id_Seguimiento_Cerda, setId_Seguimiento_Cerda] = useState('')
    const [Fecha, setFecha] = useState('')
    const [Hora, setHora] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [Id_Porcino, setId_Porcino] = useState('')
    const [Id_Tipo, setIdTipo] = useState('')
    const [Id_Responsable, setId_Responsable] = useState([])
    const [Id_Medicamento, setId_Medicamento] = useState([])

    const [porcinos, setPorcinos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [tiposActividad, setTiposActividad] = useState([])

    const [textFormButton, setTextFormButton] = useState('Enviar')

    useEffect(() => {
        getPorcinos()
        getResponsables()
        getMedicamentos()
        getTiposActividad()
    }, [])

    const parsearMultiples = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === 'string' && val.startsWith('[')) {
            try { return JSON.parse(val).map(String); } catch { return []; }
        }
        return [String(val)];
    };

    useEffect(() => {
        if (Seguimiento_CerdaEdit) {
            setId_Seguimiento_Cerda(Seguimiento_CerdaEdit.Id_Seguimiento_Cerda ?? '')
            setFecha(Seguimiento_CerdaEdit.Fecha?.split('T')[0] ?? '')
            setHora(Seguimiento_CerdaEdit.Hora ?? '')
            setObservaciones(Seguimiento_CerdaEdit.Observaciones ?? '')
            setId_Porcino(Seguimiento_CerdaEdit.Id_Porcino ?? '')
            setIdTipo(Seguimiento_CerdaEdit.Id_Tipo ?? '')
            setId_Responsable(parsearMultiples(Seguimiento_CerdaEdit.Id_Responsable))
            setId_Medicamento(parsearMultiples(Seguimiento_CerdaEdit.Id_Medicamento))
            setTextFormButton("Actualizar")
        } else {
            setId_Seguimiento_Cerda('')
            setFecha('')
            setHora('')
            setObservaciones('')
            setId_Porcino('')
            setIdTipo('')
            setId_Responsable([])
            setId_Medicamento([])
            setTextFormButton("Enviar")
        }
    }, [Seguimiento_CerdaEdit])

    const getPorcinos = async () => {
        try {
            const porcinosRes = await apiAxios.get('/porcino/')
            const lista = Array.isArray(porcinosRes.data) ? porcinosRes.data : []
            const cerdaPermitida = String(Seguimiento_CerdaEdit?.Id_Porcino || '')
            setPorcinos(lista.filter(p => {
                const gen = p.Gen_Porcino?.trim().toUpperCase()
                const tipo = p.Tipo_Cerdo?.trim().toLowerCase()
                const esHembra = gen === 'H' || gen === 'HEMBRA'
                const esAdulta = !tipo || tipo === 'adulto' || tipo === 'adulta'
                const esActiva = (p.Estado || '').trim().toLowerCase() === 'activo' || String(p.Id_Porcino) === cerdaPermitida
                return esHembra && esAdulta && esActiva
            }))
        } catch (error) {
            console.error('Error obteniendo porcinos:', error)
            setPorcinos([])
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(res.data.filter(r =>
                r.Estado === 'Activo' || (Seguimiento_CerdaEdit && Seguimiento_CerdaEdit.Id_Responsable === r.Id_Responsable)
            ))
        } catch (error) {
            console.error('Error obteniendo responsables:', error)
            setResponsables([])
        }
    }

    const getMedicamentos = async () => {
        try {
            const res = await apiAxios.get('/medicamentos/')
            setMedicamentos(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error('Error obteniendo medicamentos:', error)
            setMedicamentos([])
        }
    }

    const getTiposActividad = async () => {
        try {
            const res = await apiAxios.get('/tipos_actividad/')
            const lista = Array.isArray(res.data) ? res.data : []
            setTiposActividad(lista.filter(t =>
                !t.Estado || t.Estado === 'Activo' || (Seguimiento_CerdaEdit && Number(Seguimiento_CerdaEdit.Id_Tipo) === Number(t.Id_Tipo))
            ))
        } catch (error) {
            console.error('Error obteniendo tipos de actividad:', error)
            setTiposActividad([])
        }
    }

    const handlePorcinoChange = (e) => {
        setId_Porcino(e.target.value)
    }

    const toggleResponsable = (id) => {
        setId_Responsable(prev =>
            prev.includes(String(id)) ? prev.filter(r => r !== String(id)) : [...prev, String(id)]
        )
    }

    const toggleMedicamento = (id) => {
        setId_Medicamento(prev =>
            prev.includes(String(id)) ? prev.filter(m => m !== String(id)) : [...prev, String(id)]
        )
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        const formatMultiField = (val) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null;
            if (Array.isArray(val)) {
                return val.length === 1 ? val[0] : JSON.stringify(val);
            }
            return val;
        };

        const data = {
            Fecha,
            Hora,
            Observaciones,
            Id_Porcino,
            Id_Tipo: Id_Tipo ? Number(Id_Tipo) : null,
            Id_Responsable: formatMultiField(Id_Responsable),
            Id_Medicamento: formatMultiField(Id_Medicamento)
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/Seguimiento_Cerda/', data)
            } else {
                await apiAxios.put(
                    `/Seguimiento_Cerda/${Id_Seguimiento_Cerda}`,
                    data
                )
            }

            MySwal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Seguimiento guardado correctamente'
            })

            hideModal()
            if (reload) reload()

        } catch (error) {
            console.error(error.response?.data || error.message)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el Seguimiento'
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="text-center mb-4">
                <h5 className="fw-bold">📋 Seguimiento de Cerda</h5>
                <small className="text-muted">Trazabilidad sanitaria y tratamientos</small>
            </div>

            <div className="row g-3">

                {/* FECHA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha</label>
                    <input
                        type="date"
                        className="form-control shadow-sm"
                        value={Fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                    />
                </div>

                {/* HORA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🕐 Hora</label>
                    <input
                        type="time"
                        className="form-control shadow-sm"
                        value={Hora}
                        onChange={(e) => setHora(e.target.value)}
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
                        required
                    >
                        <option value="">Seleccione una cerda</option>
                        {porcinos.map((porcino) => (
                            <option key={porcino.Id_Porcino} value={porcino.Id_Porcino}>
                                {porcino.Nom_Porcino || (porcino.Num_Chapeta ? `Chapeta ${porcino.Num_Chapeta}` : `Cerda #${porcino.Id_Porcino}`)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* TIPO DE ACTIVIDAD */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🏷️ Tipo de Actividad</label>
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

                {/* MEDICAMENTO */}
                <div className="col-12 mt-3">
                    <SelectorMedicamentos
                        medicamentos={medicamentos}
                        seleccionados={Id_Medicamento}
                        onToggle={toggleMedicamento}
                        className="position-relative"
                    />
                </div>

                {/* RESPONSABLE */}
                <div className="col-12">
                    <SelectorResponsables
                        responsables={responsables}
                        seleccionados={Id_Responsable}
                        onToggle={toggleResponsable}
                        className="position-relative"
                    />
                </div>

                {/* OBSERVACIONES */}
                <div className="col-12">
                    <label className="form-label fw-semibold">📝 Observaciones</label>
                    <textarea
                        className="form-control shadow-sm"
                        value={Observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows="2"
                    />
                </div>

            </div>

            {/* BOTÓN */}
            <div className="d-grid mt-4">
                <button className="btn btn-primary fw-semibold py-2 shadow-sm">
                    {textFormButton}
                </button>
            </div>

        </form>
    )
}

export default Seguimiento_CerdaForm