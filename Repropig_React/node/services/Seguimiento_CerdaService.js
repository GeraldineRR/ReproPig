import Seguimiento_CerdaModel from "../models/Seguimiento_CerdaModel.js";
import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import responsablesModel from "../models/responsablesModel.js";
import MedicamentosModel from "../models/MedicamentosModel.js";
import ciclosModel from "../models/ciclosModel.js";

class Seguimiento_CerdaService {

    // ==========================================
    // OBTENER TODOS LOS SEGUIMIENTOS
    // ==========================================
    async getAll() {
        return await Seguimiento_CerdaModel.findAll({
            include: [
                { model: PorcinoModel, as: 'porcino' },
                { model: responsablesModel, as: 'Responsables' },
                { model: MedicamentosModel, as: 'medicamentos' },
                { model: ciclosModel, as: 'ciclo' },
            ],
            order: [["Id_Seguimiento_Cerda", "DESC"]]
        });
    }


    // ==========================================
    // OBTENER UN SEGUIMIENTO POR ID
    // ==========================================
    async getById(id) {
        const Seguimiento_Cerda = await Seguimiento_CerdaModel.findByPk(id, {
            include: [
                { model: PorcinoModel, as: 'porcino' },
                { model: responsablesModel, as: 'Responsables' },
                { model: MedicamentosModel, as: 'medicamentos' },
                { model: ciclosModel, as: 'ciclo' },
            ]
        })
        if (!Seguimiento_Cerda) throw new Error('Seguimiento_Cerda no encontrado')
        return Seguimiento_Cerda
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