import colectaservice from "../services/colectaService.js";
import colectaModel from "../models/colectaModel.js";

// obtener todas las colectas
export const getAllcolecta = async (req, res) => {
    try {
        let colectas = await colectaservice.getAll()
        
        const today = new Date();
        let changed = false;
        
        for (let col of colectas) {
            if (col.Tipo === 'Interno' && col.Uso_colecta === 'Si' && col.Fecha) {
                const fechaColecta = new Date(col.Fecha);
                const expirationDate = new Date(fechaColecta);
                expirationDate.setDate(expirationDate.getDate() + 3);
                
                if (today > expirationDate) {
                    await colectaModel.update({ Uso_colecta: 'No' }, { where: { Id_colecta: col.Id_colecta } });
                    changed = true;
                }
            }
        }
        
        if (changed) {
            colectas = await colectaservice.getAll();
        }

        res.status(200).json(colectas)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// obtener una colecta por id
export const getcolecta = async (req, res) => {

    console.log(req.params.id);
    try {
        const colecta = await colectaservice.getById(req.params.id)
        res.status(200).json(colecta)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
// crear una nueva colecta
export const createcolecta = async (req, res) => {
    try {
        const colecta = await colectaservice.create(req.body)
        res.status(201).json({ message: "colecta creada", colecta })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//actualizar una colecta
export const updatecolecta = async (req, res) => {
    try {
        await colectaservice.update(req.params.id, req.body)
        res.status(200).json({ message: "colecta actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
// eliminar una colecta 
export const deletecolecta = async (req, res) => {
    try {
        await colectaservice.delete(req.params.id)
        res.status(204).send()//204 No content (borrado exitoso sin cuerpo))
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}