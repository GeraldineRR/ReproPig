import PartosService from "../services/PartosService.js";


export const getALLPartos = async (req, res) => {
    try{
        const Partos = await PartosService.getALL()
        res.status(200).json(Partos)

    }catch (error){
        res.status(500).json({message: error.message})
    }
}


export const getPartos = async (req, res) => {
    try{

        const Partos = await PartosService.getById(req.params.id)
        res.status(200).json(Partos)

    }catch (error){
        res.status(404).json({message: error.message})
    }
}


export const createPartos = async (req, res) =>{
    try{

        const Partos = await PartosService.create(req.body)
        res.status(201).json({message:"Partos creada", Partos})

    }catch(error){

        res.status(400).json({message:error.message})

    }
}


export const updatePartos = async (req, res) => {
    try{
        await PartosService.update(req.params.id, req.body)
        res.status(200).json({message: "Partos actualizada correctamente"})
    }catch(error){
        res.status(400).json({message: error.message})

    }
}


export const deletePartos= async(req, res) => {
    try{
        await PartosService.delete(req.params.id)
        res.status(204).send()
    }catch(error){
        res.status(400).json({message: error.message})
    }
}