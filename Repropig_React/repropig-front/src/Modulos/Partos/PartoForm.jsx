import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"

import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const MySwal = withReactContent(Swal)

const PartosForm = ({ hideModal, rowToEdit = {} }) => {

    const [Id_Porcino, setPorcino] = useState('')
    const [Fec_inicio, setFec_inicio] = useState('')
    const [Hor_inicial, setHor_inicial] = useState('')
    const [Nac_vivos, setNac_vivos] = useState('')
    const [Nac_momias, setNac_momias] = useState('')
    const [Nac_muertos, setNac_muertos] = useState('')
    const [Pes_camada, setPes_camada] = useState('')
    const [Observaciones, setObservaciones] = useState('')
    const [Fec_fin, setFec_fin] = useState('')
    const [Hor_final, setHor_final] = useState('')
    const [estado, setestado] = useState('')
    const [Id_Reproduccion, setId_Reproduccion] = useState('')

    const [porcinos, setPorcinos] = useState([])
    const [reproduccionesActivas, setReproduccionesActivas] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    // 🔹 Cargar datos si se edita
    useEffect(() => {
        if (rowToEdit?.Id_parto) {
            loadDataInForm()
        } else {
            resetForm()
        }
    }, [rowToEdit])

    // 🔹 Resetear formulario
    const resetForm = () => {
        setFec_fin("")
        setFec_inicio("")
        setHor_final("")
        setHor_inicial("")
        setPorcino("")
        setNac_momias("")
        setNac_muertos("")
        setNac_vivos("")
        setObservaciones("")
        setPes_camada("")
        setestado("")
        setId_Reproduccion("")
        setReproduccionesActivas([])
        setTextFormButton("Enviar")
    }

    useEffect(() => {
        getPorcinos()
    }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino/')
            // Solo hembras
            setPorcinos(response.data.filter(p => p.Gen_Porcino === 'H'))
        } catch (error) {
            console.error("Error al obtener porcinos:", error)
        }
    }

    const getReproduccionesActivas = async (idPorcino) => {
        if (!idPorcino) { setReproduccionesActivas([]); return }
        try {
            const response = await apiAxios.get('/reproducciones/')
            const activas = response.data.filter(r =>
                r.Id_Cerda == idPorcino && r.Activo === 'S'
            )
            setReproduccionesActivas(activas)
        } catch (error) {
            console.error("Error al obtener reproducciones:", error)
            setReproduccionesActivas([])
        }
    }

    const handlePorcinoChange = (e) => {
        const val = e.target.value
        setPorcino(val)
        setId_Reproduccion('')
        getReproduccionesActivas(val)
    }

    const loadDataInForm = () => {
        setFec_fin(rowToEdit.Fec_fin || "")
        setFec_inicio(rowToEdit.Fec_inicio || "")
        setHor_final(rowToEdit.Hor_final || "")
        setHor_inicial(rowToEdit.Hor_inicial || "")
        setPorcino(rowToEdit.Id_Porcino || "")
        setNac_momias(rowToEdit.Nac_momias || "")
        setNac_muertos(rowToEdit.Nac_muertos || "")
        setNac_vivos(rowToEdit.Nac_vivos || "")
        setObservaciones(rowToEdit.Observaciones || "")
        setPes_camada(rowToEdit.Pes_camada || "")
        setestado(rowToEdit.estado || "")
        setId_Reproduccion(rowToEdit.Id_Reproduccion || "")
        setTextFormButton("Actualizar")

        // Cargar reproducciones de esa cerda para edición
        if (rowToEdit.Id_Porcino) {
            getReproduccionesActivas(rowToEdit.Id_Porcino)
        }
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (!Id_Porcino || !Fec_inicio || !Hor_inicial) {
            return MySwal.fire({
                title: "Campos obligatorios",
                text: "Por favor completa los campos requeridos",
                icon: "warning"
            })
        }

        const datos = {
            Id_Porcino: Number(Id_Porcino),
            Fec_inicio,
            Hor_inicial,
            Nac_vivos: Number(Nac_vivos) || 0,
            Nac_momias: Number(Nac_momias) || 0,
            Nac_muertos: Number(Nac_muertos) || 0,
            Pes_camada,
            Observaciones,
            Fec_fin,
            Hor_final,
            Id_Reproduccion: Id_Reproduccion ? Number(Id_Reproduccion) : null
        }

        try {

            // 🔵 CREATE o UPDATE
            if (!rowToEdit?.Id_parto) {

                await apiAxios.post("/partos/", datos)

                await MySwal.fire({
                    title: "Registro exitoso",
                    text: Id_Reproduccion
                        ? "Parto registrado. La reproducción fue inactivada automáticamente."
                        : "Parto creado correctamente",
                    icon: "success"
                })

            } else {

                await apiAxios.put(`/partos/${rowToEdit.Id_parto}`, datos)

                await MySwal.fire({
                    title: "Actualización exitosa",
                    text: "Parto actualizado correctamente",
                    icon: "success"
                })
            }

            hideModal()
            resetForm()

        } catch (error) {

            console.error("Error:", error.response ? error.response.data : error.message)

            MySwal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al guardar",
                icon: "error"
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="text-center mb-4">
                <h5 className="fw-bold">🐣 Registro de Parto</h5>
                <small className="text-muted">Vinculado al ciclo reproductivo</small>
            </div>

            <div className="row g-3">

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
                                {porcino.Nom_Porcino}
                            </option>
                        ))}
                    </select>
                </div>

                {/* REPRODUCCIÓN */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🔁 Reproducción</label>
                    <select
                        className="form-select shadow-sm"
                        value={Id_Reproduccion}
                        onChange={(e) => setId_Reproduccion(e.target.value)}
                    >
                        <option value="">
                            {!Id_Porcino
                                ? 'Primero seleccione una cerda'
                                : reproduccionesActivas.length === 0
                                    ? 'Sin reproducciones activas'
                                    : 'Seleccione una reproducción'}
                        </option>
                        {reproduccionesActivas.map(r => (
                            <option key={r.Id_Reproduccion} value={r.Id_Reproduccion}>
                                #{r.Id_Reproduccion} — {r.TipoReproduccion}
                            </option>
                        ))}
                    </select>
                    {Id_Reproduccion && (
                        <small className="text-warning mt-1 d-block">
                            ⚠️ Al guardar, esta reproducción se inactivará automáticamente
                        </small>
                    )}
                </div>

                {/* FECHA INICIO */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">📅 Fecha inicio</label>
                    <input type="date" className="form-control shadow-sm" value={Fec_inicio} onChange={(e) => setFec_inicio(e.target.value)} required />
                </div>

                {/* HORA INICIAL */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">🕐 Hora inicial</label>
                    <input type="time" className="form-control shadow-sm" value={Hor_inicial} onChange={(e) => setHor_inicial(e.target.value)} required />
                </div>

                {/* NACIDOS VIVOS */}
                <div className="col-md-4">
                    <label className="form-label fw-semibold">✅ Nacidos vivos</label>
                    <input type="number" min="0" className="form-control shadow-sm" value={Nac_vivos} onChange={(e) => setNac_vivos(e.target.value)} required />
                </div>

                {/* NACIDOS MOMIAS */}
                <div className="col-md-4">
                    <label className="form-label fw-semibold">⚠️ Momias</label>
                    <input type="number" min="0" className="form-control shadow-sm" value={Nac_momias} onChange={(e) => setNac_momias(e.target.value)} required />
                </div>

                {/* NACIDOS MUERTOS */}
                <div className="col-md-4">
                    <label className="form-label fw-semibold">❌ Muertos</label>
                    <input type="number" min="0" className="form-control shadow-sm" value={Nac_muertos} onChange={(e) => setNac_muertos(e.target.value)} required />
                </div>

                {/* PESO CAMADA */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">⚖️ Peso camada</label>
                    <input type="text" className="form-control shadow-sm" value={Pes_camada} onChange={(e) => setPes_camada(e.target.value)} required />
                </div>

                {/* FECHA FIN */}
                <div className="col-md-3">
                    <label className="form-label fw-semibold">📅 Fecha fin</label>
                    <input type="date" className="form-control shadow-sm" value={Fec_fin} onChange={(e) => setFec_fin(e.target.value)} />
                </div>

                {/* HORA FINAL */}
                <div className="col-md-3">
                    <label className="form-label fw-semibold">🕐 Hora final</label>
                    <input type="time" className="form-control shadow-sm" value={Hor_final} onChange={(e) => setHor_final(e.target.value)} />
                </div>

                {/* OBSERVACIONES */}
                <div className="col-12">
                    <label className="form-label fw-semibold">📝 Observaciones</label>
                    <textarea className="form-control shadow-sm" rows="2" value={Observaciones} onChange={(e) => setObservaciones(e.target.value)} />
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

export default PartosForm