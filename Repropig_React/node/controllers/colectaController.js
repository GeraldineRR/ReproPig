import colectaservice from "../services/colectaService.js";

// obtener todas las colectas
export const getAllcolecta = async (req, res) => {
    try {
        const colecta = await colectaservice.getAll()
        console.log(colecta.data)
        res.status(200).json(colecta)
        
        // console.log(JSON.stringify(colecta, null, 2))
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