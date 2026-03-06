import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig"

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


const PorcinoForm = ({ hideModal, porcinoEdit, reload }) => {
    const MySwal = withReactContent(Swal)

    const [Num_Chapeta, setNumChapeta] = useState('')
    const [Nom_Porcino, setNombre] = useState('')
    const [Fec_Nac_Porcino, setFecNacimiento] = useState('')
    const [Gen_Porcino, setGenero] = useState('')
    const [Plac_Sena_Porcino, setPlacaSena] = useState('')
    const [Proc_Porcino, setProcedencia] = useState('')
    const [Lug_Proc_Porcino, setLugarProc] = useState('')
    const [Fec_Llegada, setFecLlegada] = useState('')
    const [Peso_Llegada, setPesoLlegada] = useState('')
    const [Edad_Llegada, setEdadLlegada] = useState(0)
    const [Edad_Actual, setEdadActual] = useState(0)
    const [Id_Raza, setRaza] = useState('')
    const [razas, setRazas] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')


    const calcularEdadLlegada = (fechaNacimiento, fechaLlegada) => {
        if (!fechaNacimiento || !fechaLlegada) return 0

        const nacimiento = new Date(fechaNacimiento)
        const llegada = new Date(fechaLlegada)

        let años = llegada.getFullYear() - nacimiento.getFullYear()
        let meses = llegada.getMonth() - nacimiento.getMonth()

        if (meses < 0) {
            años--
            meses += 12
        }

        return años * 12 + meses
    }

    const calcularEdadActual = (fechaNacimiento) => {
        if (!fechaNacimiento) return 0

        const nacimiento = new Date(fechaNacimiento)
        const hoy = new Date()

        if (hoy < nacimiento) return 0

        let años = hoy.getFullYear() - nacimiento.getFullYear()
        let meses = hoy.getMonth() - nacimiento.getMonth()

        if (meses < 0) {
            años--
            meses += 12
        }

        return años * 12 + meses
    }


    useEffect(() => {
        if (Proc_Porcino !== "Externo") {
            setLugarProc('Centro Agropecuario "La Granja"')
        }
    }, [Proc_Porcino])

    useEffect(() => {
        if (Proc_Porcino === "Interno") {
            setFecLlegada(Fec_Nac_Porcino)
        }
    }, [Proc_Porcino, Fec_Nac_Porcino])

    useEffect(() => {
        getRazas()
    }, [])


    useEffect(() => {
        const edad = calcularEdadLlegada(Fec_Nac_Porcino, Fec_Llegada)
        setEdadLlegada(edad)
    }, [Fec_Nac_Porcino, Fec_Llegada])

    useEffect(() => {
        const edad = calcularEdadActual(Fec_Nac_Porcino)
        setEdadActual(edad)
    }, [Fec_Nac_Porcino])


    useEffect(() => {
        if (porcinoEdit) {
            setNumChapeta(porcinoEdit.Num_Chapeta ?? '')
            setNombre(porcinoEdit.Nom_Porcino ?? '')
            setFecNacimiento(porcinoEdit.Fec_Nac_Porcino?.split('T')[0] ?? '')
            setGenero(porcinoEdit.Gen_Porcino ?? '')
            setPlacaSena(porcinoEdit.Plac_Sena_Porcino ?? '')
            setProcedencia(porcinoEdit.Proc_Porcino ?? '')
            setLugarProc(porcinoEdit.Lug_Proc_Porcino ?? '')
            setFecLlegada(porcinoEdit.Fec_Llegada?.split('T')[0] ?? '')
            setPesoLlegada(porcinoEdit.Peso_Llegada ?? '')
            setEdadLlegada(porcinoEdit.Edad_Llegada ?? 0)
            setRaza(porcinoEdit.Id_Raza ?? '')
            setTextFormButton("Actualizar")
        } else {
            resetForm()
        }
    }, [porcinoEdit])

    const resetForm = () => {
        setNumChapeta('')
        setNombre('')
        setFecNacimiento('')
        setGenero('')
        setPlacaSena('')
        setProcedencia('')
        setLugarProc('')
        setFecLlegada('')
        setPesoLlegada('')
        setEdadLlegada(0)
        setRaza('')
        setTextFormButton("Enviar")
    }

    const getRazas = async () => {
        try {
            const response = await apiAxios.get('/raza/')
            setRazas(response.data)
        } catch (error) {
            console.error("Error cargando razas:", error)
        }
    }

    const huboCambios = () => {
        if (!porcinoEdit) return true

        return !(
            Num_Chapeta === porcinoEdit.Num_Chapeta &&
            Nom_Porcino === porcinoEdit.Nom_Porcino &&
            Fec_Nac_Porcino === porcinoEdit.Fec_Nac_Porcino?.split('T')[0] &&
            Gen_Porcino === porcinoEdit.Gen_Porcino &&
            Plac_Sena_Porcino === porcinoEdit.Plac_Sena_Porcino &&
            Proc_Porcino === porcinoEdit.Proc_Porcino &&
            Lug_Proc_Porcino === porcinoEdit.Lug_Proc_Porcino &&
            Fec_Llegada === porcinoEdit.Fec_Llegada?.split('T')[0] &&
            Number(Peso_Llegada) === Number(porcinoEdit.Peso_Llegada) &&
            Number(Id_Raza) === Number(porcinoEdit.Id_Raza)
        )
    }

    const gestionarForm = async (e) => {
        e.preventDefault()


        const edadCalculada = calcularEdadLlegada(Fec_Nac_Porcino, Fec_Llegada)
        setEdadLlegada(edadCalculada)

        const edadActualCalculada = calcularEdadActual(Fec_Nac_Porcino)
        setEdadActual(edadActualCalculada)

        const formData = new FormData()
        formData.append('Num_Chapeta', Num_Chapeta)
        formData.append('Nom_Porcino', Nom_Porcino)
        formData.append('Fec_Nac_Porcino', Fec_Nac_Porcino)
        formData.append('Gen_Porcino', Gen_Porcino)
        formData.append('Plac_Sena_Porcino', Plac_Sena_Porcino)
        formData.append('Proc_Porcino', Proc_Porcino)
        formData.append('Lug_Proc_Porcino', Lug_Proc_Porcino)
        formData.append('Fec_Llegada', Fec_Llegada)
        formData.append('Peso_Llegada', Peso_Llegada)
        formData.append('Edad_Llegada', Number(edadCalculada))
        formData.append('Id_Raza', Id_Raza)

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/porcino/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

                await reload()

                MySwal.fire({
                    title: 'Porcino registrado',
                    html: `El porcino <b>${Nom_Porcino}</b> ha sido registrado exitosamente.<br/>Edad: <b>${edadCalculada} meses</b>`,
                    icon: 'success'
                })

            } else if (textFormButton === 'Actualizar') {

                if (!huboCambios()) {
                    MySwal.fire({
                        icon: "info",
                        title: "Sin cambios",
                        text: "No se realizaron cambios en el registro."
                    })
                    return
                }

                await apiAxios.put(`/porcino/${porcinoEdit.Id_Porcino}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

                await reload()

                MySwal.fire({
                    title: 'Actualización',
                    text: 'El porcino ha sido actualizado exitosamente.',
                    icon: 'success'
                })
            }

            hideModal()
        } catch (error) {
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar el porcino."
            })
        }
    }

    return (

        <form onSubmit={gestionarForm} encType="multipart/form-data" className="col-12 col-md-12">

            <div className="mb-3">
                <label htmlFor="Nom_Porcino" className="form-label">Nombre</label>
                <input type="text" id="Nom_Porcino" className="form-control" value={Nom_Porcino} onChange={(e) => setNombre(e.target.value)} required/>
            </div>

            <div className="mb-3">
                <label htmlFor="Num_Chapeta" className="form-label">Chapeta</label>
                <input type="number" id="Num_Chapeta" className="form-control" value={Num_Chapeta} onChange={(e) => setNumChapeta(e.target.value)} required/>
            </div>

            <div className="mb-3">
                <label htmlFor="Plac_Sena_Porcino" className="form-label">Placa Sena</label>
                <input type="number" id="Plac_Sena_Porcino" className="form-control" value={Plac_Sena_Porcino} onChange={(e) => setPlacaSena(e.target.value)} required/>
            </div>

            <div className="mb-3">
                <label htmlFor="Fec_Nac_Porcino" className="form-label">Fecha de Nacimiento</label>
                <input type="date" id="Fec_Nac_Porcino" className="form-control" value={Fec_Nac_Porcino} onChange={(e) => setFecNacimiento(e.target.value)} required/>
            </div>

            <div className="mb-3">
                <label htmlFor="Genero_Porcino" className="form-label">Genero</label>
                <select id="Genero_Porcino" className="form-control" value={Gen_Porcino} onChange={(e) => setGenero(e.target.value)} required>
                    <option value="">Selecciona...</option>
                    <option value="H">Hembra</option>
                    <option value="M">Macho</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="Proc_Porcino" className="form-label">Procedencia</label>
                <select id="Proc_Porcino" className="form-control" value={Proc_Porcino} onChange={(e) => setProcedencia(e.target.value)} required>
                    <option value="">Selecciona...</option>
                    <option value="Externo">Externo</option>
                    <option value="Interno">Interno</option>
                </select>
            </div>

            {Proc_Porcino === "Externo" && (
                <div className="mb-3">
                    <label htmlFor="Lug_Proc_Porcino" className="form-label">Lugar Procedencia</label>
                    <input type="text" id="Lug_Proc_Porcino" className="form-control" value={Lug_Proc_Porcino} onChange={(e) => setLugarProc(e.target.value)} />
                </div>
            )}

            <div className="mb-3">
                <label htmlFor="Id_Raza" className="form-label">Raza</label>
                <select id="Id_Raza" className="form-control" value={Id_Raza} onChange={(e) => setRaza(e.target.value)} required>
                    <option value="">Selecciona...</option>
                    {razas.map((raza) => (
                        <option key={raza.Id_Raza} value={raza.Id_Raza}>{raza.Nom_Raza}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="Fec_Llegada" className="form-label">Fecha de Llegada</label>
                <input type="date" className="form-control" value={Fec_Llegada} onChange={(e) => setFecLlegada(e.target.value)} disabled={Proc_Porcino === "Interno"}/>
            </div>

            <div className="mb-3">
                <label htmlFor="Peso_Llegada" className="form-label">Peso de Llegada</label>
                <input type="number" step="0.01" className="form-control" value={Peso_Llegada} onChange={(e) => setPesoLlegada(e.target.value)}/>
            </div>

            <div className="mb-3">
                <input type="submit" className="btn btn-primary" value={textFormButton} />
            </div>

        </form>
    )
}

export default PorcinoForm