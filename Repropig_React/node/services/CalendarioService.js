import CalendarioModel from "../models/CalendarioModel.js";
import reproduccionesModel from "../models/reproduccionesModel.js";
const INTERVALOS_RCL = [21, 42, 63, 84, 105];
 
function calcularProyectados(fechaServicio) {
    const base = new Date(fechaServicio + 'T00:00:00');
    return INTERVALOS_RCL.map(dias => {
        const d = new Date(base);
        d.setDate(d.getDate() + dias);
        return d;
    });
}
 

class CalendarioService {
    async getAll() {
        return await CalendarioModel.findAll({
            include: [
                {
                    model: reproduccionesModel,
                    as: 'reproducciones'
                },
            ]
        })
    }
    


    

    async getById(id) {
        const Calendario = await CalendarioModel.findByPk(id,{
            include: [
                {
                    model: reproduccionesModel,
                    as: 'reproducciones'
                }
            ]
        })
        if (!Calendario) throw new Error('Calendario no encontrado')
        return Calendario
        
    }

        async create(data) {
        const { Id_Reproduccion, Fecha_Servicio } = data
 
        const [proy1, proy2, proy3, proy4, proy5] = calcularProyectados(Fecha_Servicio)
 
        return await CalendarioModel.create({
            Id_Reproduccion,
            Fecha_Servicio,
            'proyectado-1rcl': proy1,
            'proyectado-2rcl': proy2,
            'proyectado-3rcl': proy3,
            'proyectado-4rcl': proy4,
            'proyectado-5rcl': proy5,
        })
    }
 
    async update(id, data) {
        const result = await CalendarioModel.update(data, { where: { Id_Calendario: id } })
        const updated = result[0]
 
        if (updated === 0) throw new Error('Calendario no encontrado o sin cambios')
        return true
    }
 
    async delete(id) {
        const deleted = await CalendarioModel.destroy({ where: { Id_Calendario: id } })
 
        if (!deleted) throw new Error('Calendario no encontrado')
        return true
    }
}
 
export default new CalendarioService()