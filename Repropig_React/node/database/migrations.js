export async function runMigrations(db) {
    console.log('Iniciando migraciones manuales...');

    // Migraciones de Calendario
    const columns = [
        { name: 'resultado_rc1', type: 'VARCHAR(20) NULL' },
        { name: 'resultado_rc2', type: 'VARCHAR(20) NULL' },
        { name: 'observaciones_rc1', type: 'TEXT NULL' },
        { name: 'observaciones_rc2', type: 'TEXT NULL' },
        { name: 'observaciones_cambio', type: 'TEXT NULL' },
        { name: 'observaciones_107', type: 'TEXT NULL' },
        { name: 'observaciones_parto', type: 'TEXT NULL' }
    ];

    for (const col of columns) {
        try {
            await db.query(`ALTER TABLE \`Calendario\` ADD COLUMN \`${col.name}\` ${col.type};`);
            console.log(`✅ Columna ${col.name} agregada a Calendario`);
        } catch (err) {
            if (err.parent?.code !== 'ER_DUP_COLUMNNAME') {
                console.error(`⚠️ Error al agregar columna ${col.name}:`, err.message);
            }
        }
    }

    // Otras migraciones manuales
    try {
        await db.query("ALTER TABLE actividades_camada MODIFY COLUMN Id_Medicamento TEXT NULL;")
    } catch (e) {
        console.log("Aviso alter Id_Medicamento:", e.message)
    }

    try {
        await db.query("ALTER TABLE actividades_camada ADD COLUMN Id_Responsable TEXT NULL;")
    } catch (e) {
        console.log("Aviso alter Id_Responsable:", e.message)
    }

    try {
        await db.query("ALTER TABLE partos ADD COLUMN Id_Responsable TEXT NULL;")
    } catch (e) {
        console.log("Aviso alter partos Id_Responsable:", e.message)
    }

    try {
        await db.query("ALTER TABLE monta ADD COLUMN estado VARCHAR(10) DEFAULT 'Activo';")
    } catch (e) {
        console.log("Aviso alter monta estado:", e.message)
    }

    try {
        await db.query("ALTER TABLE inseminacion ADD COLUMN estado VARCHAR(10) DEFAULT 'Activo';")
    } catch (e) {
        console.log("Aviso alter inseminacion estado:", e.message)
    }

    console.log('✅ Migraciones manuales finalizadas.');
}
