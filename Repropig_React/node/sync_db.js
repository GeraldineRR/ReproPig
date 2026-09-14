import db from './database/db.js';

// Importar modelos
import './models/ciclosModel.js';
import './models/MedicamentosModel.js';
import './models/porcinoModel.js';
import './models/razaModel.js';
import './models/montaModel.js';
import './models/colectaModel.js';
import './models/inseminacionModel.js';
import './models/PartosModel.js';
import './models/actividadesCamadaModel.js';
import './models/responsablesModel.js';
import './models/Seguimiento_CerdaModel.js';
import './models/CalendarioModel.js';
import './models/novedadesModel.js';
import './models/segcamadaModel.js';

import './app.js'; 

async function syncDatabase() {
    try {
        console.log("Iniciando sincronización forzada...");
        await db.authenticate();
        
        // Desactivamos chequeos de llaves foráneas temporalmente para que MySQL no se queje
        await db.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        
        await db.sync({ alter: true });
        
        // Volvemos a activar
        await db.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
        
        console.log("¡Sincronización completada con éxito!");
        process.exit(0);
    } catch (error) {
        console.error("Error sincronizando la BD:", error);
        process.exit(1);
    }
}

syncDatabase();
