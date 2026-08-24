import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const MySwal = withReactContent(Swal)

const PartosForm = ({ hideModal, rowToEdit = {}, reload }) => {

    const [Id_Porcino, setPorcino] = useState('')
    const [Fec_inicio, setFec_inicio] = useState('')
    const [Hor_inicial, setHor_inicial] = useState('')
    const [Nac_vivos, setNac_vivos] = useState(0)
    const [Nac_momias, setNac_momias] = useState(0)
    const [Nac_muertos, setNac_muertos] = useState(0)
    const [Pes_camada, setPes_camada] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [Fec_fin, setFec_fin] = useState('')
    const [Hor_final, setHor_final] = useState('')
    const [Id_Responsable, setId_Responsable] = useState([])
    const [porcinos, setPorcinos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [textFormButton, setTextFormButton] = useState('Registrar')

    // 🔢 Total automático
    const totalNacidos =
        Number(Nac_vivos) +
        Number(Nac_momias) +
        Number(Nac_muertos)

    useEffect(() => {
        getPorcinos()
        getResponsables()
    }, [])

    const getPorcinos = async () => {
        try {
            const res = await apiAxios.get('/porcino/')
            setPorcinos(res.data.filter(p => p.Gen_Porcino === 'H' && p.Tipo_Cerdo === 'Adulto'))
        } catch (error) {
            console.error("Error al obtener porcinos:", error)
        }
    }

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get('/responsables/')
            setResponsables(res.data)
        } catch (error) {
            console.error("Error al obtener responsables:", error)
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
        if (rowToEdit?.Id_parto) {
            setPorcino(rowToEdit.Id_Porcino || '')
            setFec_inicio(rowToEdit.Fec_inicio?.split('T')[0] || '')
            setHor_inicial(rowToEdit.Hor_inicial || '')
            setNac_vivos(rowToEdit.Nac_vivos || 0)
            setNac_momias(rowToEdit.Nac_momias || 0)
            setNac_muertos(rowToEdit.Nac_muertos || 0)
            setPes_camada(rowToEdit.Pes_camada || '')
            setObservaciones(rowToEdit.Observaciones || '')
            setFec_fin(rowToEdit.Fec_fin?.split('T')[0] || '')
            setHor_final(rowToEdit.Hor_final || '')
            setId_Responsable(parsearResponsables(rowToEdit.Id_Responsable))
            setTextFormButton("Actualizar")
        } else {
            resetForm()
        }
    }, [rowToEdit])

    const resetForm = () => {
        setPorcino('')
        setFec_inicio('')
        setHor_inicial('')
        setNac_vivos(0)
        setNac_momias(0)
        setNac_muertos(0)
        setPes_camada('')
        setObservaciones('')
        setFec_fin('')
        setHor_final('')
        setId_Responsable([])
        setTextFormButton("Registrar")
    }

    const toggleResponsable = (id) => {
        const numId = Number(id)
        setId_Responsable(prev =>
            prev.includes(numId) ? prev.filter(r => r !== numId) : [...prev, numId]
        )
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (!Id_Porcino || !Fec_inicio || !Hor_inicial) {
            return MySwal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Porcino, fecha y hora inicial son obligatorios"
            })
        }

        if (totalNacidos === 0) {
            return MySwal.fire({
                icon: "warning",
                title: "Datos inválidos",
                text: "Debe haber al menos un nacimiento"
            })
        }

        const data = {
            Id_Porcino: Number(Id_Porcino),
            Fec_inicio,
            Hor_inicial,
            Nac_vivos: Number(Nac_vivos),
            Nac_momias: Number(Nac_momias),
            Nac_muertos: Number(Nac_muertos),
            Pes_camada,
            Observaciones,
            Fec_fin,
            Hor_final,
            Id_Responsable: Id_Responsable.length > 0 ? JSON.stringify(Id_Responsable) : null
        }

        try {
            if (rowToEdit?.Id_parto) {
                await apiAxios.put(`/partos/${rowToEdit.Id_parto}`, data)
                MySwal.fire("Actualizado", "Parto actualizado correctamente", "success")
            } else {
                await apiAxios.post("/partos/", data)
                MySwal.fire("Registrado", "Parto creado correctamente", "success")
            }

            await reload()
            hideModal()
            resetForm()

        } catch (error) {
            console.error(error)
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || error.message || "No se pudo guardar el parto"
            })
        }
    }

    return (
        <form onSubmit={gestionarForm}>

            {/* Porcino */}
            <div className="mb-3">
                <label className="form-label fw-semibold">Porcino</label>
                <select
                    className="form-control"
                    value={Id_Porcino}
                    onChange={(e) => setPorcino(e.target.value)}
                    required
                >
                    <option value="">Seleccione...</option>
                    {porcinos.map(p => (
                        <option key={p.Id_Porcino} value={p.Id_Porcino}>
                            {p.Nom_Porcino}
                        </option>
                    ))}
                </select>
            </div>

            {/* Inicio */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Fecha inicio</label>
                    <input type="date" className="form-control" value={Fec_inicio} onChange={(e) => setFec_inicio(e.target.value)} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Hora inicio</label>
                    <input type="time" className="form-control" value={Hor_inicial} onChange={(e) => setHor_inicial(e.target.value)} required />
                </div>
            </div>

            {/* Responsables */}
            <div className="mb-3">
                <label className="form-label fw-semibold d-block">
                    👨‍🌾 Responsables ({Id_Responsable.length})
                </label>
                <div className="d-flex flex-wrap gap-2">
                    {responsables.length === 0 ? (
                        <span className="text-muted small">No hay responsables registrados</span>
                    ) : (
                        responsables.map(r => {
                            const activo = Id_Responsable.includes(Number(r.Id_Responsable))
                            return (
                                <span
                                    key={r.Id_Responsable}
                                    onClick={() => toggleResponsable(r.Id_Responsable)}
                                    className={`px-3 py-1.5 rounded-pill user-select-none ${
                                        activo
                                            ? "bg-success text-white shadow-sm fw-bold"
                                            : "bg-white border text-secondary"
                                    }`}
                                    style={{ cursor: "pointer", fontSize: "13px" }}
                                >
                                    {activo ? "✓ " : "+ "}{r.Nombres} {r.Apellidos || ''}
                                </span>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Nacimientos */}
            <div className="row">
                <div className="col">
                    <label className="form-label fw-semibold">Vivos</label>
                    <input type="number" min="0" className="form-control" value={Nac_vivos} onChange={(e) => setNac_vivos(e.target.value)} />
                </div>
                <div className="col">
                    <label className="form-label fw-semibold">Muertos</label>
                    <input type="number" min="0" className="form-control" value={Nac_muertos} onChange={(e) => setNac_muertos(e.target.value)} />
                </div>
                <div className="col">
                    <label className="form-label fw-semibold">Momias</label>
                    <input type="number" min="0" className="form-control" value={Nac_momias} onChange={(e) => setNac_momias(e.target.value)} />
                </div>
            </div>

            {/* Total automático */}
            <div className="mt-2">
                <span className="badge bg-dark">
                    Total nacidos: {totalNacidos}
                </span>
            </div>

            {/* Peso */}
            <div className="mb-3 mt-3">
                <label className="form-label fw-semibold">Peso camada (kg)</label>
                <input type="number" step="0.01" className="form-control" value={Pes_camada} onChange={(e) => setPes_camada(e.target.value)} />
            </div>

            {/* Observaciones */}
            <div className="mb-3">
                <label className="form-label fw-semibold">Observaciones</label>
                <textarea className="form-control" value={Observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>

            {/* Fin */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Fecha fin</label>
                    <input type="date" className="form-control" value={Fec_fin} onChange={(e) => setFec_fin(e.target.value)} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Hora fin</label>
                    <input type="time" className="form-control" value={Hor_final} onChange={(e) => setHor_final(e.target.value)} required />
                </div>
            </div>

            <button className="btn btn-primary w-100 shadow-sm fw-bold py-2">
                {textFormButton}
            </button>

        </form>
    )
}

export default PartosForm