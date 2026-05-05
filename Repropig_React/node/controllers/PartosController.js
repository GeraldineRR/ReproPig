// ============================
// IMPORTACIÓN DE DEPENDENCIAS
// ============================

// Se importa el servicio de Partos que contiene toda la lógica de acceso a datos
import PartosService from "../services/PartosService.js";


// ============================
// OBTENER TODOS LOS PARTOS
// ============================

/**
 * Método: GET
 * Ruta: /partos
 * Descripción: Obtiene la lista completa de partos registrados
 */
export const getALLPartos = async (req, res) => {
    try{
        // Se llama al servicio para traer todos los partos desde la base de datos
        const Partos = await PartosService.getALL()

        // Se responde con código 200 (OK) y los datos en formato JSON
        res.status(200).json(Partos)

    }catch (error){
        // Si ocurre un error interno, se responde con código 500
        res.status(500).json({message: error.message})
    }
}


// ============================
// OBTENER PARTO POR ID
// ============================

/**
 * Método: GET
 * Ruta: /partos/:id
 * Descripción: Obtiene un parto específico según su ID
 */
export const getPartos = async (req, res) => {
    try{

        // Se obtiene el ID enviado en la URL
        // Ejemplo: /partos/5 → id = 5
        const Partos = await PartosService.getById(req.params.id)

        // Se retorna el resultado encontrado
        res.status(200).json(Partos)

    }catch (error){
        // Si no se encuentra el registro, se responde con 404
        res.status(404).json({message: error.message})
    }
}


// ============================
// CREAR NUEVO PARTO
// ============================

/**
 * Método: POST
 * Ruta: /partos
 * Descripción: Registra un nuevo parto en el sistema
 */
export const createPartos = async (req, res) =>{
    try{

        // Se envían los datos recibidos en el body al servicio
        const Partos = await PartosService.create(req.body)

        // Se responde con 201 (creado correctamente)
        res.status(201).json({
            message:"Partos creada",
            Partos
        })

    }catch(error){

        // Si hay error en los datos, se responde con 400 (error del cliente)
        res.status(400).json({message:error.message})

    }
}


// ============================ 
// ACTUALIZAR PARTO
// ============================

/**
 * Método: PUT o PATCH
 * Ruta: /partos/:id
 * Descripción: Actualiza los datos de un parto existente
 */
export const updatePartos = async (req, res) => {
    try{
        // Se envía el ID y los nuevos datos al servicio
        await PartosService.update(req.params.id, req.body)

        // Se confirma que la actualización fue exitosa
        res.status(200).json({
            message: "Partos actualizada correctamente"
        })

    }catch(error){
        // Si ocurre un error, se responde con 400
        res.status(400).json({message: error.message})

    }
}


// ============================
// ELIMINAR PARTO
// ============================

/**
 * Método: DELETE
 * Ruta: /partos/:id
 * Descripción: Elimina un parto del sistema
 */
export const deletePartos= async(req, res) => {
    try{
        // Se elimina el parto usando su ID
        await PartosService.delete(req.params.id)

        // Se responde con 204 (sin contenido)
        res.status(204).send()

    }catch(error){
        // Si hay error, se responde con 400
        res.status(400).json({message: error.message})
    }
}
