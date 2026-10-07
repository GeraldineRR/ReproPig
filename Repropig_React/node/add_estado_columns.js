import mysql from 'mysql2/promise';

async function addEstadoColumns() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'repropig'
        });

        const tables = ['colecta', 'inseminacion', 'monta', 'seguimiento_cerda', 'segcamada'];
        for (let t of tables) {
            const [cols] = await conn.query(`SHOW COLUMNS FROM ${t} LIKE 'Estado'`);
            if (cols.length === 0) {
                await conn.query(`ALTER TABLE ${t} ADD COLUMN Estado VARCHAR(20) DEFAULT 'Activo'`);
                console.log(`✅ Columna 'Estado' agregada a ${t}`);
            } else {
                console.log(`ℹ️ Columna 'Estado' ya existe en ${t}`);
            }
        }

        await conn.end();
        console.log("Completado exitosamente.");
    } catch (err) {
        console.error("Error en addEstadoColumns:", err);
    }
}

addEstadoColumns();
