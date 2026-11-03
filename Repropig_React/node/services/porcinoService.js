import PorcinoModel from "../models/porcinoModel.js"
import RazaModel from "../models/razaModel.js"
import { Op } from "sequelize"

class PorcinoService {

    async getAll() {
        return await PorcinoModel.findAll({
            where: {
                Gen_Porcino: { [Op.ne]: '-' }
            },
            include: [
                {
                    model: RazaModel,
                    as: 'raza'
                },
            ],
            order: [['Id_Porcino', 'DESC']]
        })
    }

    async getLechonesByParto(idParto) {
        return await PorcinoModel.findAll({
            where: {
                Tipo_Cerdo: 'Lechon',
                Id_parto: idParto,
                Gen_Porcino: { [Op.ne]: '-' },
                Estado: 'Activo'
            },
            include: [{ model: RazaModel, as: 'raza' }],
            order: [['Id_Porcino', 'ASC']]
        })
    }

    async getById(id) {
        const porcino = await PorcinoModel.findByPk(id,{
            include: [
                {model : RazaModel, 
                as: 'raza'
            }
            ]
        })
        if (!porcino) throw new Error('Porcino no encontrado')
        return porcino
    }

    async create(data) {
        const chapeta = (data.Num_Chapeta !== '' && data.Num_Chapeta !== undefined && data.Num_Chapeta !== null)
            ? Number(data.Num_Chapeta)
            : null;
        const placaSena = (data.Plac_Sena_Porcino !== '' && data.Plac_Sena_Porcino !== undefined && data.Plac_Sena_Porcino !== null)
            ? Number(data.Plac_Sena_Porcino)
            : null;

        if (data.Tipo_Cerdo === 'Adulto') {
            if (!chapeta) {
                throw new Error('La chapeta es obligatoria para porcinos adultos.');
            }
            if (!placaSena) {
                throw new Error('La placa SENA es obligatoria para porcinos adultos.');
            }
        }

        if (chapeta) {
            const chapetaExiste = await PorcinoModel.findOne({
                where: { Num_Chapeta: chapeta }
            });
            if (chapetaExiste) {
                throw new Error(`No se permite guardar al animal: la chapeta ${chapeta} ya se encuentra registrada.`);
            }
        }

        if (placaSena) {
            const placaExiste = await PorcinoModel.findOne({
                where: { Plac_Sena_Porcino: placaSena }
            });
            if (placaExiste) {
                throw new Error(`No se permite guardar al animal: la placa SENA ${placaSena} ya se encuentra registrada.`);
            }
        }

        const dataToSave = {
            ...data,
            Num_Chapeta: chapeta,
            Plac_Sena_Porcino: placaSena
        };

        return await PorcinoModel.create(dataToSave);
    }

    async update(id, data) {
        const porcino = await PorcinoModel.findByPk(id);
        if (!porcino) throw new Error('Porcino no encontrado');

        const tipoCerdo = data.Tipo_Cerdo !== undefined ? data.Tipo_Cerdo : porcino.Tipo_Cerdo;

        let chapeta = undefined;
        if (data.Num_Chapeta !== undefined) {
            chapeta = (data.Num_Chapeta !== '' && data.Num_Chapeta !== null)
                ? Number(data.Num_Chapeta)
                : null;
        }

        let placaSena = undefined;
        if (data.Plac_Sena_Porcino !== undefined) {
            placaSena = (data.Plac_Sena_Porcino !== '' && data.Plac_Sena_Porcino !== null)
                ? Number(data.Plac_Sena_Porcino)
                : null;
        }

        if (tipoCerdo === 'Adulto') {
            const finalChapeta = chapeta !== undefined ? chapeta : porcino.Num_Chapeta;
            const finalPlaca = placaSena !== undefined ? placaSena : porcino.Plac_Sena_Porcino;
            if (!finalChapeta) {
                throw new Error('La chapeta es obligatoria para porcinos adultos.');
            }
            if (!finalPlaca) {
                throw new Error('La placa SENA es obligatoria para porcinos adultos.');
            }
        }

        if (chapeta) {
            const chapetaExiste = await PorcinoModel.findOne({
                where: {
                    Num_Chapeta: chapeta,
                    Id_Porcino: { [Op.ne]: id }
                }
            });
            if (chapetaExiste) {
                throw new Error(`No se permite guardar al animal: la chapeta ${chapeta} ya se encuentra registrada en otro porcino.`);
            }
        }

        if (placaSena) {
            const placaExiste = await PorcinoModel.findOne({
                where: {
                    Plac_Sena_Porcino: placaSena,
                    Id_Porcino: { [Op.ne]: id }
                }
            });
            if (placaExiste) {
                throw new Error(`No se permite guardar al animal: la placa SENA ${placaSena} ya se encuentra registrada en otro porcino.`);
            }
        }

        const dataToSave = { ...data };
        if (chapeta !== undefined) dataToSave.Num_Chapeta = chapeta;
        if (placaSena !== undefined) dataToSave.Plac_Sena_Porcino = placaSena;

        await PorcinoModel.update(dataToSave, { where: { Id_Porcino: id } });
        return true;
    }

    async delete(id) {
        const deleted = await PorcinoModel.destroy({ where: { Id_Porcino: id } })

        if (!deleted) throw new Error('Porcino no encontrado')
        return true
    }
}

export default new PorcinoService()