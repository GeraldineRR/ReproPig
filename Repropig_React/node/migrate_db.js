import mysql from 'mysql2/promise';

async function migrate() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'repropig'
        });

        // 1. Alter medicamentos table to add Estado if missing
        const [medCols] = await conn.query("SHOW COLUMNS FROM medicamentos LIKE 'Estado'");
        if (medCols.length === 0) {
            await conn.query("ALTER TABLE medicamentos ADD COLUMN Estado VARCHAR(20) DEFAULT 'Activo'");
            console.log("✅ Columna 'Estado' agregada a medicamentos");
        } else {
            console.log("ℹ️ Columna 'Estado' ya existe en medicamentos");
        }

        // 2. Check partos table for estado
        const [partoCols] = await conn.query("SHOW COLUMNS FROM partos LIKE 'estado'");
        if (partoCols.length === 0) {
            await conn.query("ALTER TABLE partos ADD COLUMN estado VARCHAR(20) DEFAULT 'Activo'");
            console.log("✅ Columna 'estado' agregada a partos");
        } else {
            console.log("ℹ️ Columna 'estado' ya existe en partos");
        }

        await conn.end();
        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration error:", err);
    }
}

migrate();
