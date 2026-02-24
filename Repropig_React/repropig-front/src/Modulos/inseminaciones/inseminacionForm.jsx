import { useEffect, useState } from "react";
import apiAxios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import WithReactContent from "sweetalert2-react-content";


const InseminacionForm = ({ hideModal, rowToEdit = {}, refreshTable }) => {
    const MySwal = WithReactContent(Swal)

    const [Fec_hora, setFec_hora] = useState('');
    const [Id_Porcino, setId_Porcino] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [Id_Responsables, setId_Responsables] = useState('');
    const [Id_colecta, setId_colecta] = useState('');
    const [Observaciones, setObservaciones] = useState('');
    const [Id_Reproduccion, setId_Reproduccion] = useState('');
    const [porcinos, setPorcinos] = useState([]);
    const [textFormButton, setTextFormButton] = useState('Agregar Inseminacion');

    useEffect(() => {
        getPorcinos()
    }, [])

    const getPorcinos = async () => {
        try {
            const response = await apiAxios.get('/api/porcino')
            setPorcinos(response.data)
            console.log(response.data)
        } catch (error) {
            console.error('Error al obtener porcinos:', error);
        }
    }

    useEffect(() => {
        if (rowToEdit.Id_Inseminacion) {
            loadDataInform()
        } else {
            setFec_hora('')
            setId_Porcino('')
            setCantidad('')
            setId_Responsables('')
            setId_colecta('')
            setObservaciones('')
            setId_Reproduccion('')
            setTextFormButton('Agregar Inseminacion')
        }
    }, [rowToEdit]);

    const loadDataInform = () => {
        setFec_hora(rowToEdit.Fec_hora?.split('T')[0] || '')
        setId_Porcino(rowToEdit.Id_Porcino)
        setCantidad(rowToEdit.cantidad)
        setId_Responsables(rowToEdit.Id_Responsables)
        setId_colecta(rowToEdit.Id_colecta)
        setObservaciones(rowToEdit.Observaciones)
        setId_Reproduccion(rowToEdit.Id_Reproduccion)
        setTextFormButton('Actualizar Inseminacion')
    }

    const gestionarForm = async (e) => {
        e.preventDefault();
        const formData = {
            Fec_hora,
            Id_Porcino,
            cantidad,
            Id_Responsables,
            Id_colecta,
            Observaciones,
            Id_Reproduccion,
        };

        if (textFormButton === 'Agregar Inseminacion') {
            try {
                const response = await apiAxios.post('/api/inseminacion', formData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })//enviar el formulario al backend con el metodo post 
                const data = response.data// axios devuelve el cuerpo de la respuesta en la propiedad data


                MySwal.fire({
                    title: "Actualizacion exitosa",
                    text: "inseminacion creada con éxito",
                    icon: "success",
                })

                hideModal()
                refreshTable()

            } catch (error) {
                console.error('Error al crear inseminacion:', error.response ? error.response.data : error.message);
                alert(error.message)
            }
        } else if (textFormButton === 'Actualizar Inseminacion') {
            try {
                const response = await apiAxios.put('/api/inseminacion/' + rowToEdit.Id_Inseminacion, formData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })//enviar el formulario al backend con el metodo post

                const data = response.data// axios devuelve el cuerpo de la respuesta en la propiedad data

                hideModal()
                refreshTable()

                MySwal.fire({
                    title: "Actualizacion exitosa",
                    text: "Inseminacion actualizada con éxito",
                    icon: "success",
                })

            } catch (error) {
                console.error('Error al actualizar inseminacion:', error.response ? error.response.data : error.message);
                alert(error.message)
            }
        }
    };

    return (
        <>
            <form onSubmit={gestionarForm} className="col-12 col-md-6">

                <div className="mb-3">
                    <label className="form-label">Fec_hora</label>
                    <input type="date" className="form-control"
                        value={Fec_hora}
                        onChange={e => setFec_hora(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Id Porcino</label>
                    <select className="form-select"
                        value={Id_Porcino}
                        onChange={e => setId_Porcino(e.target.value)}>
                        <option value="">Seleccione</option>
                        {porcinos.map(porcino => (
                            <option key={porcino.Id_Porcino} value={porcino.Id_Porcino}>{porcino.Nom_Porcino}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input type="text" className="form-control"
                        value={cantidad}
                        onChange={e => setCantidad(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">ID Responsable</label>
                    <input type="text" className="form-control"
                        value={Id_Responsables}
                        onChange={e => setId_Responsables(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Id Colecta</label>
                    <input type="text" className="form-control"
                        value={Id_colecta}
                        onChange={e => setId_colecta(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Observaciones</label>
                    <input type="text" className="form-control"
                        value={Observaciones}
                        onChange={e => setObservaciones(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Id Reproduccion</label>
                    <input type="text" className="form-control"
                        value={Id_Reproduccion}
                        onChange={e => setId_Reproduccion(e.target.value)} />
                </div>

                <input type="submit" className="btn btn-primary w-50" value={textFormButton} />
            </form>
        </>
    );
};

export default InseminacionForm;
