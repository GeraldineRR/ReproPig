import MedicamentosService from "../services/MedicamentosService.js"


export const getALLMedicamento = async (req, res) => {
    try{
        const medicamento = await MedicamentosService.getALL()
        res.status(200).json(medicamento)

    }catch (error){
        res.status(500).json({message: error.message})
    }
}


export const getMedicamento = async (req, res) => {
    try{

        const medicamento = await MedicamentosService.getById(req.params.id)
        res.status(200).json(medicamento)

    }catch (error){
        res.status(404).json({message: error.message})
    }
}


export const createMedicamento = async (req, res) =>{
    try{

        const medicamento = await MedicamentosService.create(req.body)
        res.status(201).json({message:"Medicamento creado", medicamento})

    }catch(error){

        res.status(400).json({message:error.message})

    }
}


export const updateMedicamento = async (req, res) => {
    try{
        await MedicamentosService.update(req.params.id, req.body)
        res.status(200).json({message: "Medicamento actualizado correctamente"})
    }catch(error){
        res.status(400).json({message: error.message})

    }
}


export const deleteMedicamento = async(req, res) => {
    try{
        await MedicamentosService.delete(req.params.id)
        res.status(204).send()
    }catch(error){
        res.status(400).json({message: error.message})
    }
}

export const toggleEstadoMedicamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { default: MedicamentosModel } = await import("../models/MedicamentosModel.js");
        const med = await MedicamentosModel.findByPk(id);
        if (!med) return res.status(404).json({ message: "Medicamento no encontrado" });
        const nuevoEstado = (med.Estado === 'Inactivo' || med.estado === 'Inactivo') ? 'Activo' : 'Inactivo';
        await MedicamentosModel.update({ Estado: nuevoEstado }, { where: { Id_Medicamento: id } });
        res.json({ message: "Estado actualizado", Estado: nuevoEstado });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}