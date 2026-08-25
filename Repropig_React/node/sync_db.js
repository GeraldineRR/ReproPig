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

// Relaciones
import './app.js'; // Ejecuta las relaciones y la inicialización, pero podemos solo sincronizar

async function syncDatabase() {
    try {
        console.log("Iniciando sincronización de la base de datos...");
        await db.authenticate();
        console.log("Conectado a la BD.");
        
        // El alter: true modifica las tablas para que coincidan con los modelos sin borrar datos
        await db.sync({ alter: true });
        console.log("¡Sincronización completada! Todas las columnas faltantes fueron agregadas.");
        process.exit(0);
    } catch (error) {
        console.error("Error sincronizando la BD:", error);
        process.exit(1);
    }
}

syncDatabase();
