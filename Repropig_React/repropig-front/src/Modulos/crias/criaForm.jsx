import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig"

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const CriaForm = ({ hideModal, criaEdit, reload}) => {
    const MySwal = withReactContent(Swal)

    const [Id_parto, setIdParto] = useState('')
    const [Num_Cria, setNumCria] = useState('')
    const [Sexo, setSexo] = useState('')
    const [Estado, setEstado] = useState('')
    const [Causa_Muerte, setCausaMuerte] = useState('')
    const [Fecha_Muerte, setFechaMuerte] = useState('')
    const [partos, setPartos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const handlePartoChange = async (value) => {
    setIdParto(value)

    if (criaEdit) return

    if (!value) {
        setNumCria('')
        return
    }

    try {
        const response = await apiAxios.get(`/cria/count/${value}`)
        const total = response.data

        setNumCria(total + 1)
    } catch (error) {
        console.error(error)
    }
}

    useEffect(() => {
        Partos()
    }, [])

    const Partos = async () => {
        try {
            const response = await apiAxios.get('/partos/')
            setPartos(response.data)
        } catch (error) {
            console.error("Error cargando partos:", error)
        }
    }

    useEffect(() => {
        if (criaEdit) {
            setIdParto(criaEdit.Id_parto ?? '')
            setNumCria(criaEdit.Num_Cria ?? '')
            setSexo(criaEdit.Sexo ?? '')
            setEstado(criaEdit.Estado ?? '')
            setCausaMuerte(criaEdit.Causa_Muerte ?? '')
            setFechaMuerte(criaEdit.Fecha_Muerte?.split('T')[0] ?? '')
            setTextFormButton("Actualizar")
        } else {
            resetForm()
        }
    }, [criaEdit])

    const resetForm = () => {
        setIdParto('')
        setNumCria('')
        setSexo('')
        setEstado('')
        setCausaMuerte('')
        setFechaMuerte('')
        setTextFormButton("Enviar")
    }

    const huboCambios = () => {
        if (!criaEdit) return true

        return !(
            Id_parto === criaEdit.Id_parto &&
            Num_Cria === criaEdit.Num_Cria &&
            Sexo === criaEdit.Sexo &&
            Estado === criaEdit.Estado &&
            Causa_Muerte === criaEdit.Causa_Muerte &&
            Fecha_Muerte === criaEdit.Fecha_Muerte?.split('T')[0]
        )
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        const data = {
            Id_parto,
            Num_Cria,
            Sexo,
            Estado,
            Causa_Muerte: Estado === 'Muerto' ? Causa_Muerte : null,
            Fecha_Muerte: Estado === 'Muerto' ? Fecha_Muerte : null
        }

        try {
            if (textFormButton === 'Enviar') {

                await apiAxios.post('/cria/', data)
                await reload()

                MySwal.fire({
                    title: 'Cría registrada',
                    text: 'La cría fue registrada correctamente.',
                    icon: 'success'
                })

            } else {

                if (!huboCambios()) {
                    MySwal.fire({
                        icon: "info",
                        title: "Sin cambios",
                        text: "No se realizaron cambios."
                    })
                    return
                }

                await apiAxios.put(`/cria/${criaEdit.Id_Cria}`, data)
                await reload()

                MySwal.fire({
                    title: 'Actualizado',
                    text: 'La cría fue actualizada.',
                    icon: 'success'
                })
            }

            hideModal()

        } catch (error) {
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "No se pudo guardar la cría"
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="mb-3">
                <label htmlFor="Id_parto" className="form-label">Parto</label>
                <select id="Id_parto" className="form-control" value={Id_parto} onChange={(e) => handlePartoChange (e.target.value)} required>
                    <option value="">Selecciona...</option>
                    {partos.map((parto) => (
                        <option key={parto.Id_parto} value={parto.Id_parto}>Parto #{parto.Id_parto} - {parto.porcinos?.Nom_Porcino || 'Sin nombre'} - {parto.Fec_fin}</option>
                    ))}
                </select>
            </div>

            {Id_parto && Num_Cria && (
                <>
                    <div className="mb-3">
                        <label className="form-label">Número de Cría</label>
                        {Num_Cria && Id_parto && (
                            <div className="alert alert-info py-2"> Cría #{Num_Cria} del parto {Id_parto} </div> )}
                    </div>
                </>
            )}

            <div className="mb-3">
                <label className="form-label">Sexo</label>
                <select className="form-control" value={Sexo} onChange={(e) => setSexo(e.target.value)} required>
                    <option value="">Selecciona...</option>
                    <option value="H">Hembra</option>
                    <option value="M">Macho</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Estado</label>
                <select className="form-control" value={Estado} onChange={(e) => setEstado(e.target.value)} required>
                    <option value="">Selecciona...</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Muerto">Muerto</option>
                </select>
            </div>

            {Estado === "Muerto" && (
                    <>
                        <div className="mb-3">
                            <label className="form-label">Causa de Muerte</label>
                            <input type="text" className="form-control" value={Causa_Muerte} onChange={(e) => setCausaMuerte(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Fecha de Muerte</label>
                            <input type="date" className="form-control" value={Fecha_Muerte} onChange={(e) => setFechaMuerte(e.target.value)} />
                        </div>
                    </>
                )
            }

            <div className="mb-3">
                <input type="submit" className="btn btn-primary" value={textFormButton} />
            </div>

        </form >
    )
}

export default CriaForm