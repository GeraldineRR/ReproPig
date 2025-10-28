import resposablesmodel from "../models/playerModel"; 

class responsablesservice {

    async getALL() {
        return await resposablesmodel.findAll();
    }

    async getById(id) {

        const resposable = await resposablesmodel.findByPk(id);
        if (!resposable) throw new Error('Resposable not found');
        return resposable;

    }

    async create(data) {
        return await resposablesmodel.create(data);
    }


    async update(id, data) {
        const result = await resposablesmodel.update(data, { where: {id} })
        const update = result[0];

        if (update === 0) throw new Error('Resposable no encontrado o sin cambios');

        return true
    }

    async delete(id) {
        const delate = await resposablesmodel.destroy({ where: {id} });

        if (!delate) throw new Error('Resposable no encontrado');
        return true;
    }

}


export default new responsablesservice();