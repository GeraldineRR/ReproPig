import bcrypt from 'bcryptjs';
import db from './database/db.js';
import ciclosModel from './models/ciclosModel.js';
import PorcinoModel from './models/porcinoModel.js';
import montaModel from './models/montaModel.js';
import inseminacionModel from './models/inseminacionModel.js';
import responsablesModel from './models/responsablesModel.js';

// Setup relations like app.js
ciclosModel.belongsTo(PorcinoModel, { foreignKey: 'Id_Cerda', as: 'porcino' });
PorcinoModel.hasMany(ciclosModel, { foreignKey: 'Id_Cerda', as: 'ciclos' });
ciclosModel.hasMany(montaModel, { foreignKey: 'Id_Ciclo', as: 'montas' });
ciclosModel.hasMany(inseminacionModel, { foreignKey: 'Id_Ciclo', as: 'inseminaciones' });

async function run() {
    try {
        await db.authenticate();
        console.log("DB connected");

        // Fix juanka
        let juanka = await responsablesModel.findOne({ where: { Nombres: 'juanka' } });
        if (!juanka) juanka = await responsablesModel.findOne({ where: { Nombres: 'Juanka' } });
        if (!juanka) juanka = await responsablesModel.findOne({ where: { Email: 'juanka' } });
        
        if (juanka) {
            const hash = await bcrypt.hash('456', 10);
            juanka.Password = hash;
            await juanka.save();
            console.log("Password for juanka updated to 456");
        } else {
            console.log("User juanka not found!");
        }

        // Test ciclos
        const ciclos = await ciclosModel.findAll({
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Id_Porcino', 'Nom_Porcino'] },
                { model: montaModel, as: 'montas', attributes: ['Id_Monta', 'Fec_hora'], separate: true },
                { model: inseminacionModel, as: 'inseminaciones', attributes: ['Id_Inseminacion', 'Fec_hora'], separate: true }
            ]
        });
        console.log("Ciclos found:", ciclos.length);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        process.exit();
    }
}
run();
