import NacimientoService from "../services/NacimientoService";

export const getAllNacimiento = async (requestAnimationFrame, res) => {
    try{
        const Nacimiento = await NacimientoService.getAll()
        res.status(200).json(Nacimiento)
    
    }catch (error){
        res.status(500).json({message: error.message})
    }
}
export const getNacimiento = async (req,res) => {
    try{
        const Nacimiento = await NacimientoService.getById(req.params.id)
        res.status(200).json(Nacimiento)
    }catch(error){
        res.status(404).json({message: error.message})
    }
}
export const createNacimiento = async (req, res) =>{
    try{
        const Nacimiento = await NacimientoService.create(req.body)
        res.status(201).json({message:"Nacimiento creado",player})
    }catch(error){
        res.status(400).json({message:error.message})
    }
}
export const updateNacimiento = async (req, res) => {
    try{
        await NacimientoService.update(req.params.id, req.body)
        res.status(200).json({message: "Nacimiento actualizado correctamente"})
    }catch(error){
        res.status(400).json({message: error.message})
    }
}
export const deleteNacimiento = async(req, res) =>{
    try{
        await NacimientoService.delete(req.params.id)
        res.status(204).send()
    }catch(error){
        res.status(400).json({messade: error.message})
    }
}