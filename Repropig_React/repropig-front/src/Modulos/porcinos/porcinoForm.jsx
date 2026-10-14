import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig"

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


const PorcinoForm = ({ hideModal, porcinoEdit, reload, initialTipo = 'Todos', onSuccess, forcedPartoId, forcedFecNac, loopInfo }) => {
    const MySwal = withReactContent(Swal)

    const defaultName = loopInfo && !porcinoEdit ? `Lechón #${loopInfo.current} (${loopInfo.nombreMadre || 'Madre'} - Parto #${forcedPartoId})` : '';

    const [Num_Chapeta, setNumChapeta] = useState('')
    const [Nom_Porcino, setNombre] = useState(defaultName)
    const [Fec_Nac_Porcino, setFecNacimiento] = useState(forcedFecNac ? forcedFecNac.split('T')[0] : '')
    const [Gen_Porcino, setGenero] = useState('')
    const [Tipo_Cerdo, setTipoCerdo] = useState(initialTipo === 'Todos' ? 'Adulto' : initialTipo)
    const [Plac_Sena_Porcino, setPlacaSena] = useState('')
    const [Proc_Porcino, setProcedencia] = useState('')
    const [Lug_Proc_Porcino, setLugarProc] = useState('')
    const [Fec_Llegada, setFecLlegada] = useState('')
    const [Peso_Llegada, setPesoLlegada] = useState('')
    const [Edad_Llegada, setEdadLlegada] = useState(0)
    const [Edad_Actual, setEdadActual] = useState(0)
    const [Id_Raza, setRaza] = useState('')
    const [razas, setRazas] = useState([])
    const [listaPorcinos, setListaPorcinos] = useState([])
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const [Pes_Nacer, setPesNacer] = useState('')
    const [Pes_21_Dias, setPes21Dias] = useState('')
    const [Fec_21_Dias, setFec21Dias] = useState('')
    const [Pes_Destete, setPesDestete] = useState('')
    const [Fec_Destete, setFecDestete] = useState('')
    const [Observaciones, setObservaciones] = useState('')


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
        getPorcinos()
    }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/porcino/')
            setListaPorcinos(response.data || [])
        } catch (error) {
            console.error("Error cargando porcinos:", error)
        }
    }


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
            setTipoCerdo(porcinoEdit.Tipo_Cerdo ?? 'Adulto')
            setPlacaSena(porcinoEdit.Plac_Sena_Porcino ?? '')
            setProcedencia(porcinoEdit.Proc_Porcino ?? '')
            setLugarProc(porcinoEdit.Lug_Proc_Porcino ?? '')
            setFecLlegada(porcinoEdit.Fec_Llegada?.split('T')[0] ?? '')
            setPesoLlegada(porcinoEdit.Peso_Llegada ?? '')
            setEdadLlegada(porcinoEdit.Edad_Llegada ?? 0)
            setRaza(porcinoEdit.Id_Raza ?? '')
            setTextFormButton("Actualizar")
            
            setPesNacer(porcinoEdit.Pes_Nacer ?? '')
            setPes21Dias(porcinoEdit.Pes_21_Dias ?? '')
            setFec21Dias(porcinoEdit.Fec_21_Dias?.split('T')[0] ?? '')
            setPesDestete(porcinoEdit.Pes_Destete ?? '')
            setFecDestete(porcinoEdit.Fec_Destete?.split('T')[0] ?? '')
            setObservaciones(porcinoEdit.Observaciones ?? '')
        } else {
            resetForm()
        }
    }, [porcinoEdit])

    const resetForm = () => {
        setNumChapeta('')
        setNombre(defaultName || '')
        setFecNacimiento(forcedFecNac ? forcedFecNac.split('T')[0] : '')
        setGenero('')
        setTipoCerdo(initialTipo === 'Todos' ? 'Adulto' : initialTipo)
        setPlacaSena('')
        setProcedencia('')
        setLugarProc('')
        setFecLlegada('')
        setPesoLlegada('')
        setEdadLlegada(0)
        setEdadActual(0)
        setRaza('')
        setTextFormButton("Enviar")

        setPesNacer('')
        setPes21Dias('')
        setFec21Dias('')
        setPesDestete('')
        setFecDestete('')
        setObservaciones('')
    }

    const getRazas = async () => {
        try {
            const response = await apiAxios.get('/raza/')
            setRazas(response.data)
        } catch (error) {
            console.error("Error cargando razas:", error)
        }
    }

    useEffect(() => {
        if (Fec_Nac_Porcino && Tipo_Cerdo === 'Lechon') {
            const date = new Date(Fec_Nac_Porcino);
            date.setDate(date.getDate() + 21);
            setFec21Dias(date.toISOString().split('T')[0]);
        }
    }, [Fec_Nac_Porcino, Tipo_Cerdo])

    const huboCambios = () => {
        if (!porcinoEdit) return true

        return !(
            Num_Chapeta === porcinoEdit.Num_Chapeta &&
            Nom_Porcino === porcinoEdit.Nom_Porcino &&
            Fec_Nac_Porcino === porcinoEdit.Fec_Nac_Porcino?.split('T')[0] &&
            Gen_Porcino === porcinoEdit.Gen_Porcino &&
            Tipo_Cerdo === porcinoEdit.Tipo_Cerdo &&
            Plac_Sena_Porcino === porcinoEdit.Plac_Sena_Porcino &&
            Proc_Porcino === porcinoEdit.Proc_Porcino &&
            Lug_Proc_Porcino === porcinoEdit.Lug_Proc_Porcino &&
            Fec_Llegada === porcinoEdit.Fec_Llegada?.split('T')[0] &&
            Number(Peso_Llegada) === Number(porcinoEdit.Peso_Llegada) &&
            Number(Id_Raza) === Number(porcinoEdit.Id_Raza) &&
            Number(Pes_Nacer) === Number(porcinoEdit.Pes_Nacer) &&
            Number(Pes_21_Dias) === Number(porcinoEdit.Pes_21_Dias) &&
            Fec_21_Dias === porcinoEdit.Fec_21_Dias?.split('T')[0] &&
            Number(Pes_Destete) === Number(porcinoEdit.Pes_Destete) &&
            Fec_Destete === porcinoEdit.Fec_Destete?.split('T')[0] &&
            Observaciones === porcinoEdit.Observaciones
        )
    }

    const chapetaDuplicada = Num_Chapeta !== '' && Num_Chapeta !== null && listaPorcinos.find(p => 
        p.Num_Chapeta !== null && 
        Number(p.Num_Chapeta) === Number(Num_Chapeta) && 
        (!porcinoEdit || Number(p.Id_Porcino) !== Number(porcinoEdit.Id_Porcino))
    )

    const placaDuplicada = Tipo_Cerdo === 'Adulto' && Plac_Sena_Porcino !== '' && Plac_Sena_Porcino !== null && listaPorcinos.find(p => 
        p.Plac_Sena_Porcino !== null && 
        Number(p.Plac_Sena_Porcino) === Number(Plac_Sena_Porcino) && 
        (!porcinoEdit || Number(p.Id_Porcino) !== Number(porcinoEdit.Id_Porcino))
    )

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (chapetaDuplicada) {
            MySwal.fire({
                icon: 'warning',
                title: 'Chapeta ya registrada',
                html: `La chapeta <b>#${Num_Chapeta}</b> ya se encuentra asignada al porcino <b>"${chapetaDuplicada.Nom_Porcino || 'Sin nombre'}"</b> (${chapetaDuplicada.Tipo_Cerdo}).<br/><br/>No se permite registrar dos animales con el mismo número de chapeta.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Entendido'
            })
            return
        }

        if (placaDuplicada) {
            MySwal.fire({
                icon: 'warning',
                title: 'Placa SENA ya registrada',
                html: `La placa SENA <b>#${Plac_Sena_Porcino}</b> ya se encuentra asignada al porcino <b>"${placaDuplicada.Nom_Porcino || 'Sin nombre'}"</b> (${placaDuplicada.Tipo_Cerdo}).<br/><br/>No se permite registrar dos porcinos con la misma placa.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Entendido'
            })
            return
        }


        const edadCalculada = calcularEdadLlegada(Fec_Nac_Porcino, Fec_Llegada)
        setEdadLlegada(edadCalculada)

        const edadActualCalculada = calcularEdadActual(Fec_Nac_Porcino)
        setEdadActual(edadActualCalculada)

        const data = {
            Num_Chapeta,
            Nom_Porcino,
            Fec_Nac_Porcino,
            Gen_Porcino,
            Tipo_Cerdo,
            Plac_Sena_Porcino: Tipo_Cerdo === 'Adulto' ? Plac_Sena_Porcino : null,
            Proc_Porcino: Tipo_Cerdo === 'Adulto' ? Proc_Porcino : 'Interno',
            Lug_Proc_Porcino: Tipo_Cerdo === 'Adulto' ? Lug_Proc_Porcino : null,
            Fec_Llegada: Tipo_Cerdo === 'Adulto' ? Fec_Llegada : null,
            Peso_Llegada: Tipo_Cerdo === 'Adulto' ? Peso_Llegada : null,
            Edad_Llegada: Tipo_Cerdo === 'Adulto' ? Number(edadCalculada) : null,
            Id_Raza: Tipo_Cerdo === 'Adulto' ? Id_Raza : null,
            Pes_Nacer: Tipo_Cerdo === 'Lechon' ? Pes_Nacer : null,
            Pes_21_Dias: Tipo_Cerdo === 'Lechon' ? Pes_21_Dias : null,
            Fec_21_Dias: Tipo_Cerdo === 'Lechon' ? Fec_21_Dias : null,
            Pes_Destete: Tipo_Cerdo === 'Lechon' ? Pes_Destete : null,
            Fec_Destete: Tipo_Cerdo === 'Lechon' ? Fec_Destete : null,
            Observaciones: Tipo_Cerdo === 'Lechon' ? Observaciones : null,
            Id_parto: forcedPartoId || null
        }

        try {
            if (textFormButton === 'Enviar') {
                await apiAxios.post('/porcino/', data)

                if (reload) await reload()
                await getPorcinos()

                resetForm()

                if (onSuccess) {
                    onSuccess()
                } else {
                    MySwal.fire({
                        title: 'Porcino registrado',
                        html: `El porcino <b>${Nom_Porcino}</b> ha sido registrado exitosamente.<br/>Edad: <b>${edadCalculada} meses</b>`,
                        icon: 'success'
                    })
                    hideModal()
                }

            } else if (textFormButton === 'Actualizar') {

                if (!huboCambios()) {
                    MySwal.fire({
                        icon: "info",
                        title: "Sin cambios",
                        text: "No se realizaron cambios en el registro."
                    })
                    return
                }

                await apiAxios.put(`/porcino/${porcinoEdit.Id_Porcino}`, data)

                await reload()
                await getPorcinos()

                MySwal.fire({
                    title: 'Actualización',
                    text: 'El porcino ha sido actualizado exitosamente.',
                    icon: 'success'
                })
                hideModal()
            }

        } catch (error) {
            const errorMsg = error.response?.data?.message || "No se pudo guardar el porcino."
            MySwal.fire({
                icon: "error",
                title: "Atención",
                text: errorMsg
            })
        }
    }

    return (

        <form onSubmit={gestionarForm} encType="multipart/form-data" className="col-12 col-md-12">

            <div className="text-center mb-4">
                <h5 className="fw-bold">
                    {Tipo_Cerdo === 'Adulto' ? '🐗' : '🐽'} {porcinoEdit ? 'Editar ' : 'Registrar '} {Tipo_Cerdo === 'Adulto' ? 'Adulto' : 'Lechón'}
                </h5>
                <small className="text-muted">Gestión de animales</small>
                {loopInfo && (
                    <div className="alert alert-info py-2 mt-2">
                        <span className="fw-bold">Registro en cadena (Parto)</span><br/>
                        Lechón {loopInfo.current} de {loopInfo.total}
                    </div>
                )}
            </div>

            {initialTipo === 'Todos' && !porcinoEdit && (
                <div className="mb-3">
                    <label htmlFor="Tipo_Cerdo" className="form-label fw-semibold">🐽 Tipo de Cerdo</label>
                    <select id="Tipo_Cerdo" className="form-control" value={Tipo_Cerdo} onChange={(e) => setTipoCerdo(e.target.value)} required>
                        <option value="Adulto">Adulto</option>
                        <option value="Lechon">Lechón</option>
                    </select>
                </div>
            )}

            <div className="mb-3">
                <label htmlFor="Nom_Porcino" className="form-label fw-semibold">🏷️ Nombre</label>
                <input type="text" id="Nom_Porcino" className="form-control" value={Nom_Porcino} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label htmlFor="Num_Chapeta" className="form-label fw-semibold">🔖 Chapeta</label>
                <input 
                    type="number" 
                    id="Num_Chapeta" 
                    className={`form-control ${chapetaDuplicada ? 'is-invalid border-danger' : ''}`} 
                    value={Num_Chapeta} 
                    onChange={(e) => setNumChapeta(e.target.value)} 
                    placeholder="Número de chapeta único"
                    required 
                />
                {chapetaDuplicada && (
                    <div className="text-danger small mt-1 fw-bold">
                        ⚠️ Esta chapeta (#{Num_Chapeta}) ya está asignada a "{chapetaDuplicada.Nom_Porcino || 'Porcino'}" ({chapetaDuplicada.Tipo_Cerdo}). Debe ser única.
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label htmlFor="Fec_Nac_Porcino" className="form-label fw-semibold">🎂 Fecha de Nacimiento</label>
                <input type="date" id="Fec_Nac_Porcino" className="form-control" value={Fec_Nac_Porcino} onChange={(e) => setFecNacimiento(e.target.value)} required disabled={!!forcedFecNac && !porcinoEdit} />
            </div>

            <div className="mb-3">
                <label htmlFor="Genero_Porcino" className="form-label fw-semibold">⚥ Sexo</label>
                <select id="Genero_Porcino" className="form-control" value={Gen_Porcino} onChange={(e) => setGenero(e.target.value)} required>
                    <option value="">Selecciona...</option>
                    <option value="H">Hembra</option>
                    <option value="M">Macho</option>
                </select>
            </div>

            {Tipo_Cerdo === 'Adulto' && (
                <>
                    <div className="mb-3">
                        <label htmlFor="Plac_Sena_Porcino" className="form-label fw-semibold">🪪 Placa Sena</label>
                        <input 
                            type="number" 
                            id="Plac_Sena_Porcino" 
                            className={`form-control ${placaDuplicada ? 'is-invalid border-danger' : ''}`} 
                            value={Plac_Sena_Porcino} 
                            onChange={(e) => setPlacaSena(e.target.value)} 
                            placeholder="Número de placa único"
                            required 
                        />
                        {placaDuplicada && (
                            <div className="text-danger small mt-1 fw-bold">
                                ⚠️ Esta placa SENA (#{Plac_Sena_Porcino}) ya está asignada a "{placaDuplicada.Nom_Porcino || 'Porcino'}". Debe ser única.
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Proc_Porcino" className="form-label fw-semibold">📍 Procedencia</label>
                        <select id="Proc_Porcino" className="form-control" value={Proc_Porcino} onChange={(e) => setProcedencia(e.target.value)} required>
                            <option value="">Selecciona...</option>
                            <option value="Externo">Externo</option>
                            <option value="Interno">Interno</option>
                        </select>
                    </div>

                    {Proc_Porcino === "Externo" && (
                        <div className="mb-3">
                            <label htmlFor="Lug_Proc_Porcino" className="form-label fw-semibold">🗺️ Lugar Procedencia</label>
                            <input type="text" id="Lug_Proc_Porcino" className="form-control" value={Lug_Proc_Porcino} onChange={(e) => setLugarProc(e.target.value)} />
                        </div>
                    )}

                    <div className="mb-3">
                        <label htmlFor="Id_Raza" className="form-label fw-semibold">🧬 Raza</label>

                        {razas.filter((raza) => raza.Estado !== 'Inactivo').length === 0 ? (
                            <div className="alert alert-danger" role="alert">
                                <p>No hay razas disponibles. Registra una raza primero.</p>
                            </div>
                        ) : (
                            <select id="Id_Raza" className="form-control" value={Id_Raza} onChange={(e) => setRaza(e.target.value)} required>
                                <option value="">Selecciona...</option>
                                {razas
                                    .filter((raza) => raza.Estado !== 'Inactivo')
                                    .map((raza) => (
                                        <option key={raza.Id_Raza} value={raza.Id_Raza}> {raza.Nom_Raza} </option>
                                    ))}
                            </select>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Fec_Llegada" className="form-label fw-semibold">📅 Fecha de Llegada</label>
                        <input type="date" className="form-control" value={Fec_Llegada} onChange={(e) => setFecLlegada(e.target.value)} disabled={Proc_Porcino === "Interno"} required />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Peso_Llegada" className="form-label fw-semibold">⚖️ Peso de Llegada</label>
                        <input type="number" step="0.01" className="form-control" value={Peso_Llegada} onChange={(e) => setPesoLlegada(e.target.value)} />
                    </div>
                </>
            )}

            {Tipo_Cerdo === 'Lechon' && (
                <>
                    <div className="mb-3">
                        <label htmlFor="Pes_Nacer" className="form-label fw-semibold">⚖️ Peso al Nacer (kg)</label>
                        <input type="number" step="0.01" id="Pes_Nacer" className="form-control" value={Pes_Nacer} onChange={(e) => setPesNacer(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Fec_21_Dias" className="form-label fw-semibold">📅 Fecha a los 21 días (Automático)</label>
                        <input type="date" className="form-control bg-light" value={Fec_21_Dias} readOnly />
                        <small className="text-muted d-block mt-1">Calculado sumando 21 días a la fecha de nacimiento.</small>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Pes_21_Dias" className="form-label fw-semibold">⚖️ Peso a los 21 días (kg)</label>
                        <input type="number" step="0.01" id="Pes_21_Dias" className="form-control" value={Pes_21_Dias} onChange={(e) => setPes21Dias(e.target.value)} placeholder="Ej: 6.5" />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Fec_Destete" className="form-label fw-semibold">📅 Fecha de Destete</label>
                        <input type="date" className="form-control" value={Fec_Destete} onChange={(e) => setFecDestete(e.target.value)} />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Pes_Destete" className="form-label fw-semibold">⚖️ Peso al Destete (kg)</label>
                        <input type="number" step="0.01" id="Pes_Destete" className="form-control" value={Pes_Destete} onChange={(e) => setPesDestete(e.target.value)} placeholder="Ej: 7.2" />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Observaciones" className="form-label fw-semibold">📝 Observaciones</label>
                        <textarea id="Observaciones" className="form-control" rows="3" value={Observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
                    </div>
                </>
            )}

            <div className="mb-3 mt-4">
                <input type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" value={textFormButton} />
            </div>

        </form>
    )
}

export default PorcinoForm