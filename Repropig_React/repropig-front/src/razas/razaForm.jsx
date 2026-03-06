import { useState, useEffect } from "react"
import apiAxios from "../axios/axiosConfig.js"

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const RazaForm = ({ hideModal, razaEdit, reload }) => {

    const MySwal = withReactContent(Swal)

    const [Nom_Raza, setNomRaza] = useState('')
    const [textFormButton, setTextFormButton] = useState('Guardar')

    useEffect(() => {
        if (razaEdit) {
            setNomRaza(razaEdit.Nom_Raza ?? '')
            setTextFormButton('Actualizar')
        } else {
            resetForm()
        }
    }, [razaEdit])

    const resetForm = () => {
        setNomRaza('')
        setTextFormButton('Guardar')
    }

    const huboCambios = () => {
        if (!razaEdit) return true
        return Nom_Raza !== razaEdit.Nom_Raza
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        if (!Nom_Raza.trim()) {
            MySwal.fire({
                icon: "warning",
                title: "Campo requerido",
                text: "El nombre de la raza es obligatorio."
            })
            return
        }

        try {

            if (textFormButton === 'Guardar') {

                await apiAxios.post('/api/razas/', {
                    Nom_Raza
                })

                await reload()

                MySwal.fire({
                    title: 'Raza registrada',
                    text: `La raza "${Nom_Raza}" ha sido registrada exitosamente.`,
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

                await apiAxios.put(`/api/razas/${razaEdit.Id_Raza}`, {
                    Nom_Raza
                })

                await reload()

                MySwal.fire({
                    title: 'Actualización exitosa',
                    text: 'La raza ha sido actualizada correctamente.',
                    icon: 'success'
                })
            }

            hideModal()

        } catch (error) {
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar la raza."
            })
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            <div className="mb-3">
                <label htmlFor="Nom_Raza" className="form-label">
                    Nombre de la Raza
                </label>

                <input
                    type="text"
                    id="Nom_Raza"
                    className="form-control"
                    value={Nom_Raza}
                    onChange={(e) => setNomRaza(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <input
                    type="submit"
                    className="btn btn-primary"
                    value={textFormButton}
                />
            </div>

        </form>
    )
}

export default RazaForm