import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig"

import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const MySwal = withReactContent(Swal)

const PartosForm = ({ hideModal, rowToEdit = {} }) => {

    const [Id_parto, setId_parto] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [Fec_inicio, setFec_inicio] = useState('');
    const [Hor_inicial, setHor_inicial] = useState('');
    const [Nac_vivos, setNac_vivos] = useState('');
    const [Nac_momias, setNac_momias] = useState('');
    const [Nac_muertos, setNac_muertos] = useState('');
    const [Pes_camada, setPes_camada] = useState('');
    const [Observaciones, setObservaciones] = useState('');
    const [Fec_fin, setFec_fin] = useState('');
    const [Hor_final, setHor_final] = useState('');
    const [textFormButton, setTextFormButton] = useState('Enviar');

    useEffect(() => {
        if (rowToEdit?.id) {
            loadDataInForm()
        } else {
            resetForm()
        }
    }, [rowToEdit])

    const resetForm = () => {
        setFec_fin("")
        setFec_inicio("")
        setHor_final("")
        setHor_inicial("")
        setId_Porcino("")
        setId_parto("")
        setNac_momias("")
        setNac_muertos("")
        setNac_vivos("")
        setObservaciones("")
        setPes_camada("")
        setTextFormButton("Enviar")
    }

    const loadDataInForm = () => {
        setFec_fin(rowToEdit.Fec_fin || "")
        setFec_inicio(rowToEdit.Fec_inicio || "")
        setHor_final(rowToEdit.Hor_final || "")
        setHor_inicial(rowToEdit.Hor_inicial || "")
        setId_Porcino(rowToEdit.Id_Porcino || "")
        setId_parto(rowToEdit.Id_parto || "")
        setNac_momias(rowToEdit.Nac_momias || "")
        setNac_muertos(rowToEdit.Nac_muertos || "")
        setNac_vivos(rowToEdit.Nac_vivos || "")
        setObservaciones(rowToEdit.Observaciones || "")
        setPes_camada(rowToEdit.Pes_camada || "")
        setTextFormButton("Actualizar")
    }

    const gestionarForm = async (e) => {

        e.preventDefault()

        const datos = {
            Id_parto,
            Id_Porcino,
            Fec_inicio,
            Hor_inicial,
            Nac_vivos,
            Nac_momias,
            Nac_muertos,
            Pes_camada,
            Observaciones,
            Fec_fin,
            Hor_final
        }

        try {

            if (textFormButton === "Enviar") {

                await apiAxios.post("/api/Partos", datos)

                await MySwal.fire({
                    title: "Registro exitoso",
                    text: "Parto creado correctamente",
                    icon: "success"
                })

            } else {

                await apiAxios.put("/api/Partos/" + rowToEdit.id, datos)

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
                text: error.response?.data?.message || error.message,
                icon: "error"
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12 col-md-12">

            <div className="mb-3">
                <label className="form-label">Id Parto:</label>
                <input type="text" className="form-control"
                    value={Id_parto}
                    onChange={(e) => setId_parto(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label className="form-label">Id Porcino:</label>
                <input type="text" className="form-control"
                    value={Id_Porcino}
                    onChange={(e) => setId_Porcino(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label>Fecha inicio</label>
                <input type="date" className="form-control"
                    value={Fec_inicio}
                    onChange={(e) => setFec_inicio(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Hora inicial:</label>
                <input type="time" className="form-control"
                    value={Hor_inicial}
                    onChange={(e) => setHor_inicial(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label className="form-label">Nacidos vivos:</label>
                <input type="number" className="form-control"
                    value={Nac_vivos}
                    onChange={(e) => setNac_vivos(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label className="form-label">Nacidos momias:</label>
                <input type="number" className="form-control"
                    value={Nac_momias}
                    onChange={(e) => setNac_momias(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label className="form-label">Nacidos muertos:</label>
                <input type="number" className="form-control"
                    value={Nac_muertos}
                    onChange={(e) => setNac_muertos(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label className="form-label">Peso de camada:</label>
                <input type="text" className="form-control"
                    value={Pes_camada}
                    onChange={(e) => setPes_camada(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label className="form-label">Observaciones:</label>
                <input type="text" className="form-control"
                    value={Observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <label>Fecha fin</label>
                <input type="date" className="form-control"
                    value={Fec_fin}
                    onChange={(e) => setFec_fin(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Hora final:</label>
                <input type="time" className="form-control"
                    value={Hor_final}
                    onChange={(e) => setHor_final(e.target.value)}
                    required />
            </div>

            <div className="mb-3">
                <input
                    type="submit"
                    className="btn btn-primary w-50"
                    value={textFormButton}
                />
            </div>

        </form>
    )
}

export default PartosForm
