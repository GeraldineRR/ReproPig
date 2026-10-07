import mysql from 'mysql2/promise';

async function fixColectasTable() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'repropig'
        });

        // Crear la tabla colecta si no existe
        await conn.query(`
            CREATE TABLE IF NOT EXISTS colecta (
                Id_colecta INT AUTO_INCREMENT PRIMARY KEY,
                Fecha DATETIME,
                Uso_colecta ENUM('Si', 'No') DEFAULT 'No',
                Tipo ENUM('Interno', 'Externo') DEFAULT 'Interno',
                Id_Porcino INT NULL,
                Id_Responsable VARCHAR(255),
                volumen DECIMAL(6, 2),
                color VARCHAR(50),
                olor VARCHAR(50),
                cant_generada INT DEFAULT 0,
                cant_utilizada INT DEFAULT 0,
                Observaciones VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("✅ Tabla colecta verificada/creada correctamente");

        // Insertar datos de prueba si esta vacia
        const [rows] = await conn.query("SELECT COUNT(*) as count FROM colecta");
        if (rows[0].count === 0) {
            await conn.query(`
                INSERT INTO colecta (Fecha, Uso_colecta, Tipo, Id_Porcino, Id_Responsable, volumen, color, olor, cant_generada, cant_utilizada, Observaciones)
                VALUES 
                (NOW(), 'Si', 'Interno', NULL, '1', 250.00, 'Blanco cremoso', 'Característico', 10, 2, 'Colecta de rutina'),
                (NOW(), 'No', 'Externo', NULL, '1', 180.00, 'Blanco', 'Normal', 5, 0, 'Semen importado');
            `);
            console.log("✅ Datos de muestra insertados en colecta");
        }

        await conn.end();
    } catch (err) {
        console.error("Error en fixColectasTable:", err);
    }
}

fixColectasTable();
