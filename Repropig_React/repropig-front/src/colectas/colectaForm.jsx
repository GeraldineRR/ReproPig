import { useEffect, useState } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";

const ColectaForm = ({hideModal, rowToEdit = {}}) => {
    const MySwal = WithReactContent(Swal)

    const [Id_colecta, setId_colecta] = useState('');
    const [Fecha, setFecha] = useState('');
    const [Uso_colecta, setUso_colecta] = useState('');
    const [Tipo, setTipo] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [Id_Responsables, setId_Responsables] = useState('');
    const [volumen, setVolumen] = useState('');
    const [color, setColor] = useState('');
    const [olor, setOlor] = useState('');
    const [cant_generada, setCant_generada] = useState('');
    const [cant_utilizada, setCant_utilizada] = useState('');
    const [Observaciones, setObservaciones] = useState('');

    const [textFormButton, setTextFormButton] = useState('Agregar Colecta');

    useEffect(() => {
        if (rowToEdit.Id_colecta) {
            loadDataInform()
        }else{
            setFecha('')
            setUso_colecta('')
            setTipo('')
            setId_Porcino('')
            setId_Responsables('')
            setVolumen('')
            setColor('')
            setOlor('')
            setCant_generada('')
            setCant_utilizada('')
            setObservaciones('')
        }
    }, [rowToEdit]);
    
    const loadDataInform = () => {
            setFecha(rowToEdit.Fecha)
            setUso_colecta(rowToEdit.Uso_colecta)
            setTipo(rowToEdit.Tipo)
            setId_Porcino(rowToEdit.Id_Porcino)
            setId_Responsables(rowToEdit.Id_Responsables)
            setVolumen(rowToEdit.volumen)
            setColor(rowToEdit.color)
            setOlor(rowToEdit.olor)
            setCant_generada(rowToEdit.cant_generada)
            setCant_utilizada(rowToEdit.cant_utilizada)
            setObservaciones(rowToEdit.Observaciones)
            setTextFormButton('Actualizar Colecta')
    }

    const gestionarForm = async (e) => {
        e.preventDefault();
            const formData = {
                Fecha,
                Uso_colecta,
                Tipo,
                Id_Porcino,
                Id_Responsables,
                volumen,
                color,
                olor,
                cant_generada,
                cant_utilizada,
                Observaciones
            };

        if (textFormButton === 'Agregar Colecta') {
            try {
               const response = await apiAxios.post('/api/colecta',formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })//enviar el formulario al backend con el metodo post 
                const data =response.data// axios devuelve el cuerpo de la respuesta en la propiedad data

                alert('Colecta creada con éxito')
                MySwal.fire({
                    title:"Actualizacion exitosa",
                    text:"colecta creada con éxito",
                    icon:"success",
                })
                hideModal()

            } catch (error) {
                console.error('Error al crear colecta:', error.response ? error.response.data : error.message);
                alert(error.message)
            }
        }else if (textFormButton === 'Actualizar Colecta') {
            try {
                const response = await apiAxios.put('/api/colecta/'+rowToEdit.Id_colecta, formData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })//enviar el formulario al backend con el metodo post

                    const data =response.data// axios devuelve el cuerpo de la respuesta en la propiedad data
                    alert('Colecta actualizada con éxito')
                    hideModal()
            } catch (error) {
                console.error('Error al actualizar colecta:', error.response ? error.response.data : error.message);
                alert(error.message)
            }
        }
    };

    return (
        <>
            <form onSubmit={gestionarForm} className="col-12 col-md-6">

                <div className="mb-3">
                    <label className="form-label">Fecha</label>
                    <input type="date" className="form-control"
                        value={Fecha}
                        onChange={e => setFecha(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Uso_colecta</label>
                    <select className="form-select"
                        value={Uso_colecta}
                        onChange={e => setUso_colecta(e.target.value)}>
                        <option value="">Seleccione</option>
                        <option value="Si">Sí</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <div>
                    <label className="form-label">Tipo</label>
                    <select className="form-select"
                        value={Tipo}
                        onChange={e => setTipo(e.target.value)}>
                        <option value="">Seleccione</option>
                        <option value="Colecta">Interno</option>
                        <option value="Externo">Externo</option>
                    </select>
                </div>
                <div>
                    <label className="form-label">ID Porcino</label>
                    <input type="text" className="form-control"
                        value={Id_Porcino}
                        onChange={e => setId_Porcino(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">ID Responsable</label>
                    <input type="text" className="form-control"
                        value={Id_Responsables}
                        onChange={e => setId_Responsables(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Volumen</label>
                    <input type="number" step="0.01" className="form-control"
                        value={volumen}
                        onChange={e => setVolumen(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input type="text" className="form-control"
                        value={color}
                        onChange={e => setColor(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Olor</label>
                    <input type="text" className="form-control"
                        value={olor}
                        onChange={e => setOlor(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Cantidad Generada</label>
                    <input type="number" step="0.01" className="form-control"
                        value={cant_generada}
                        onChange={e => setCant_generada(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Cantidad Utilizada</label>
                    <input type="number" step="0.01" className="form-control"
                        value={cant_utilizada}
                        onChange={e => setCant_utilizada(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Observaciones</label>
                    <textarea className="form-control"
                        value={Observaciones}
                        onChange={e => setObservaciones(e.target.value)} />
                </div>

                <input type="submit" className="btn btn-primary w-50" value={textFormButton} />
            </form>
        </>
    );
};

export default ColectaForm;
