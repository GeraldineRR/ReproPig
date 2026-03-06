import reproduccionesService from "../services/reproduccionesService.js";

// obtener todas las reproducciones
export const getAllreproducciones = async (req, res) => {
    try {
        const reproducciones = await reproduccionesService.getAll()
        res.status(200).json(reproducciones)

    }catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// obtener una reproduccion por id
export const getReproducciones = async (req, res) => {

    console.log(req.params.id);
    try {
       const reproducciones = await reproduccionesService.getById(req.params.id)
       res.status(200).json(reproducciones)
    }catch (error) {
        res.status(404).json({ message: error.message })
    }
}
// crear una nueva reproduccion
export const createreproducciones = async (req, res) => {
    try {
        const reproducciones = await reproduccionesService.create(req.body)
        res.status(201).json({ message:"reproduccion creada",reproducciones})
    }catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//actualizar una reproduccion
export const updatereproducciones = async (req, res) => {
    try {
        await reproduccionesService.update(req.params.id, req.body)
        res.status(200).json({ message: "reproduccion actualizada correctamente" })
    }catch(error) {
        res.status(400).json({ message: error.message })
    }
}
// eliminar una reproduccion 
export const deletereproducciones = async (req, res) => {
    try {
        await reproduccionesService.delete(req.params.id)
        res.status(204).send()//204 No content (borrado exitoso sin cuerpo))
    }catch (error) {
        res.status(400).json({ message: error.message })
    }
}