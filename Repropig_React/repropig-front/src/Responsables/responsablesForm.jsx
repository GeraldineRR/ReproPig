import { useEffect, useState } from "react";
import apiAxios from "../api/axiosConfig";

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const ResponsablesForm = ({ hidemodal, rowToEdit, textformbutton, setTextformbutton }) => {

    const MySwal = withReactContent(Swal);

    const [Id_Responsable, setId_Responsable] = useState('');
    const [Nombres, setNombres] = useState('');
    const [Apellidos, setApellidos] = useState('');          
    const [Documento, setDocumento] = useState('');
    const [Cargo, setCargo] = useState('');
    const [Telefono, setTelefono] = useState('');
    const [Email, setEmail] = useState('');

    // 🔥 LIMPIAR FORMULARIO
    const limpiarFormulario = () => {
        setId_Responsable('');
        setNombres('');
        setApellidos('');
        setDocumento('');
        setCargo('');
        setTelefono('');
        setEmail('');
    };

    // 🔥 CARGAR DATOS  EDITAR
    useEffect(() => {
        if (rowToEdit && rowToEdit.Id_Responsable) {
            setId_Responsable(rowToEdit.Id_Responsable || '');
            setNombres(rowToEdit.Nombres || '');
            setApellidos(rowToEdit.Apellidos || '');
            setDocumento(rowToEdit.Documento || '');
            setCargo(rowToEdit.Cargo || '');
            setTelefono(rowToEdit.Telefono || '');
            setEmail(rowToEdit.Email || '');
            setTextformbutton('Actualizar Responsable');
        } else {
            limpiarFormulario();
            setTextformbutton('Crear Responsable');
        }
    }, [rowToEdit]);

    const GestionarForm = async (e) => {

        e.preventDefault();

        const formData = {
            Nombres,
            Apellidos,
            Documento,
            Cargo,
            Telefono,
            Email
        };

        // 🔹 CREAR
        if (textformbutton === 'Crear Responsable') {
            try {

                await apiAxios.post('/responsables', formData);

                MySwal.fire({
                    title: 'Creado',
                    text: 'Responsable creado correctamente',
                    icon: 'success',
                });

                limpiarFormulario();
                hidemodal();

            } catch (error) {
                console.error('Error al crear:', error);
                alert(error.message);
            }
        }

        // 🔹 ACTUALIZAR
        else if (textformbutton === 'Actualizar Responsable') {
            try {

                await apiAxios.put(
                    `/responsables/${Id_Responsable}`,
                    formData
                );

                MySwal.fire({
                    title: 'Actualizado',
                    text: 'Responsable actualizado correctamente',
                    icon: 'success',
                });

                limpiarFormulario();
                hidemodal();

            } catch (error) {
                console.error('Error al actualizar:', error.response ? error.response.data : error.message);
                alert(error.message);
            }
        }
    };

    return (
        <>
            <form onSubmit={GestionarForm} className="col-12 col-md-12">

                <div className="mb-3">
                    <label className="form-label">Nombres</label>
                    <input
                        type="text"
                        className="form-control"
                        value={Nombres || ''}
                        onChange={(e) => setNombres(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Apellidos</label>
                    <input
                        type="text"
                        className="form-control"
                        value={Apellidos || ''}
                        onChange={(e) => setApellidos(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Documento</label>
                    <input
                        type="text"
                        className="form-control"
                        value={Documento || ''}
                        onChange={(e) => setDocumento(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Cargo</label>
                    <select
                        className="form-control"
                        value={Cargo || ''}
                        onChange={(e) => setCargo(e.target.value)}
                    >
                        <option value="">Seleccione un cargo</option>
                        <option value="Pasante">Pasante</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Gestor">Gestor</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                        type="text"
                        className="form-control"
                        value={Telefono || ''}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={Email || ''}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary">
                    {textformbutton}
                </button>

            </form>
        </>
    );
};

export default ResponsablesForm;