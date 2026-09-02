import Seguimiento_CerdaModel from "../models/Seguimiento_CerdaModel.js";
import PartosModel from "../models/PartosModel.js";

class Seguimiento_CerdaService {

    // ==========================================
    // OBTENER TODOS LOS SEGUIMIENTOS
    // ==========================================
    async getAll() {

        const registros = await Seguimiento_CerdaModel.findAll({
            order: [
                ["Id_Seguimiento_Cerda", "DESC"]
            ]
        });

        return registros;
    }


    // ==========================================
    // OBTENER UN SEGUIMIENTO POR ID
    // ==========================================
    async getById(id) {

        const seguimiento =
            await Seguimiento_CerdaModel.findByPk(id);

        if (!seguimiento) {
            throw new Error(
                "Seguimiento de cerda no encontrado"
            );
        }

        return seguimiento;
    }


    // ==========================================
    // OBTENER SEGUIMIENTOS POR PARTO
    // ==========================================
    async getByParto(idParto) {

        // Buscar el parto
        const parto = await PartosModel.findByPk(idParto);

        if (!parto) {
            throw new Error(
                "Parto no encontrado"
            );
        }

        // El seguimiento se relaciona con la cerda
        // mediante Id_Porcino
        const registros =
            await Seguimiento_CerdaModel.findAll({
                where: {
                    Id_Porcino: parto.Id_Porcino
                },
                order: [
                    ["Fecha", "ASC"],
                    ["Hora", "ASC"]
                ]
            });

        return registros;
    }


    // ==========================================
    // CREAR
    // ==========================================
    async create(data) {

        const nuevoSeguimiento =
            await Seguimiento_CerdaModel.create(data);

        return nuevoSeguimiento;
    }


    // ==========================================
    // ACTUALIZAR
    // ==========================================
    async update(id, data) {

        const seguimiento =
            await Seguimiento_CerdaModel.findByPk(id);

        if (!seguimiento) {
            throw new Error(
                "Seguimiento de cerda no encontrado"
            );
        }

        await seguimiento.update(data);

        return seguimiento;
    }


    // ==========================================
    // ELIMINAR
    // ==========================================
    async delete(id) {

        const seguimiento =
            await Seguimiento_CerdaModel.findByPk(id);

        if (!seguimiento) {
            throw new Error(
                "Seguimiento de cerda no encontrado"
            );
        }

        await seguimiento.destroy();

        return true;
    }
}

export default new Seguimiento_CerdaService();