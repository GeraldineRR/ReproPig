import inseminacionservice from "../services/inseminacionservice.js";

// obtener todas las inseminaciones
export const getAllinseminacion = async (req, res) => {
    try {
        const inseminacion = await inseminacionservice.getAll()
        console.log(inseminacion.data)
        res.status(200).json(inseminacion)
        
        // console.log(JSON.stringify(inseminacion, null, 2))
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// obtener una inseminacion por id
export const getinseminacion = async (req, res) => {

    console.log(req.params.id);
    try {
        const inseminacion = await inseminacionservice.getById(req.params.id)
        res.status(200).json(inseminacion)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
// crear una nueva inseminacion
export const createinseminacion = async (req, res) => {
    try {
        const inseminacion = await inseminacionservice.create(req.body)
        res.status(201).json({ message: "inseminacion creada", inseminacion })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//actualizar una inseminacion
export const updateinseminacion = async (req, res) => {
    try {
        await inseminacionservice.update(req.params.id, req.body)
        res.status(200).json({ message: "inseminacion actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
// eliminar una inseminacion 
export const deleteinseminacion = async (req, res) => {
    try {
        await inseminacionservice.delete(req.params.id)
        res.status(204).send()//204 No content (borrado exitoso sin cuerpo))
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}