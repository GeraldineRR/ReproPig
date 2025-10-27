import MortalidadService from "../services/MortalidadService.js";


export const getALLMortalidad = async (req, res) => {
    try{
        const mortalidad = await MortalidadService.getALL()
        res.status(200).json(mortalidad)

    }catch (error){
        res.status(500).json({message: error.message})
    }
}


export const getMortalidad = async (req, res) => {
    try{

        const mortalidad = await MortalidadService.getById(req.params.id)
        res.status(200).json(mortalidad)

    }catch (error){
        res.status(404).json({message: error.message})
    }
}


export const createMortalidad = async (req, res) =>{
    try{

        const mortalidad = await MortalidadService.create(req.body)
        res.status(201).json({message:"Mortalidad creada", mortalidad})

    }catch(error){

        res.status(400).json({message:error.message})

    }
}


export const updateMortalidad = async (req, res) => {
    try{
        await MortalidadService.update(req.params.id, req.body)
        res.status(200).json({message: "Mortalidad actualizada correctamente"})
    }catch(error){
        res.status(400).json({message: error.message})

    }
}


export const deleteMortalidad = async(req, res) => {
    try{
        await MortalidadService.delete(req.params.id)
        res.status(204).send()
    }catch(error){
        res.status(400).json({message: error.message})
    }
}