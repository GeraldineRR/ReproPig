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
    const [porcinos, setPorcinos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Registrar')

    // 🔢 Total automático
    const totalNacidos =
        Number(Nac_vivos) +
        Number(Nac_momias) +
        Number(Nac_muertos)

    useEffect(() => {
        getPorcinos()
    }, [])

    const getPorcinos = async () => {
        try {
            const res = await apiAxios.get('/porcino/')
            setPorcinos(res.data)
        } catch (error) {
            console.error(error)
        }
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
        setTextFormButton("Registrar")
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
            Hor_final
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
                text: "No se pudo guardar el parto"
            })
        }
    }

    return (
        <form onSubmit={gestionarForm}>

            {/* Porcino */}
            <div className="mb-3">
                <label>Porcino</label>
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
            <div className="mb-3">
                <label>Fecha inicio</label>
                <input type="date" className="form-control" value={Fec_inicio} onChange={(e) => setFec_inicio(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label>Hora inicio</label>
                <input type="time" className="form-control" value={Hor_inicial} onChange={(e) => setHor_inicial(e.target.value)} required />
            </div>

            {/* Nacimientos */}
            <div className="row">
                <div className="col">
                    <label>Vivos</label>
                    <input type="number" min="0" className="form-control" value={Nac_vivos} onChange={(e) => setNac_vivos(e.target.value)} />
                </div>
                <div className="col">
                    <label>Muertos</label>
                    <input type="number" min="0" className="form-control" value={Nac_muertos} onChange={(e) => setNac_muertos(e.target.value)} />
                </div>
                <div className="col">
                    <label>Momias</label>
                    <input type="number" min="0" className="form-control" value={Nac_momias} onChange={(e) => setNac_momias(e.target.value)} />
                </div>
            </div>

            {/* 🔥 Total automático */}
            <div className="mt-2">
                <span className="badge bg-dark">
                    Total nacidos: {totalNacidos}
                </span>
            </div>

            {/* Peso */}
            <div className="mb-3 mt-3">
                <label>Peso camada (kg)</label>
                <input type="number" step="0.01" className="form-control" value={Pes_camada} onChange={(e) => setPes_camada(e.target.value)} />
            </div>

            {/* Observaciones */}
            <div className="mb-3">
                <label>Observaciones</label>
                <textarea className="form-control" value={Observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>

            {/* Fin */}
            <div className="mb-3">
                <label>Fecha fin</label>
                <input type="date" className="form-control" value={Fec_fin} onChange={(e) => setFec_fin(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label>Hora fin</label>
                <input type="time" className="form-control" value={Hor_final} onChange={(e) => setHor_final(e.target.value)} required />
            </div>

            <button className="btn btn-primary w-100">
                {textFormButton}
            </button>

        </form>
    )
}

export default PartosForm