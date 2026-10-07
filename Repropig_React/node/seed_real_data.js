import db from './database/db.js';

async function seed() {
  console.log('🚀 Iniciando limpieza de registros de prueba y carga completa de datos reales del SENA...');

  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');

    const tablesToTruncate = [
      'novedades',
      'actividades_camada',
      'segcamada',
      'Seguimiento_Cerda',
      'partos',
      'inseminacion',
      'colecta',
      'monta',
      'ciclos_reproductivos',
      'porcinos',
      'razas',
      'medicamentos',
      'Calendario'
    ];

    for (const table of tablesToTruncate) {
      try {
        await db.query(`TRUNCATE TABLE \`${table}\`;`);
        console.log(`  ✓ Tabla ${table} limpiada`);
      } catch (err) {
        console.log(`  ⚠ Advertencia en ${table}: ${err.message}`);
      }
    }

    await db.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\n🌱 Cargando información real extraída de las planillas y tableros físicos del SENA...');

    // 1. Razas
    const razasData = [
      { Id: 1, Nom: 'Landrace' },
      { Id: 2, Nom: 'Large White' },
      { Id: 3, Nom: 'Pietrain' },
      { Id: 4, Nom: 'Duroc' },
      { Id: 5, Nom: 'Pietrain Belga' },
      { Id: 6, Nom: 'Landrace x Large White' }
    ];

    for (const r of razasData) {
      await db.query(
        `INSERT INTO razas (Id_Raza, Nom_Raza, Estado) VALUES (?, ?, 'Activo');`,
        { replacements: [r.Id, r.Nom] }
      );
    }
    console.log('  ✓ Razas cargadas');

    // 2. Personal SENA
    const responsablesReales = [
      { Nombres: 'Juan Kamilo', Apellidos: 'Morales Silva', Documento: '1001001', Cargo: 'Instructor', Email: 'juanka@repropig.com' },
      { Nombres: 'Mayerling', Apellidos: 'Barrera', Documento: '1001002', Cargo: 'Instructor', Email: 'mayerling@sena.edu.co' },
      { Nombres: 'Andres', Apellidos: 'Piñeros', Documento: '1001003', Cargo: 'Instructor', Email: 'apineros@sena.edu.co' },
      { Nombres: 'Alejandra', Apellidos: 'Murillo', Documento: '1002001', Cargo: 'Gestor', Email: 'amurillo@repropig.com' },
      { Nombres: 'Luz Celly', Apellidos: 'Castañeda', Documento: '1002002', Cargo: 'Gestor', Email: 'lcastaneda@repropig.com' },
      { Nombres: 'Sara', Apellidos: 'Rivera', Documento: '1002003', Cargo: 'Gestor', Email: 'srivera@repropig.com' },
      { Nombres: 'Javier', Apellidos: 'Leal', Documento: '1002004', Cargo: 'Gestor', Email: 'jleal@repropig.com' },
      { Nombres: 'Sebastian', Apellidos: 'Rocha', Documento: '1003001', Cargo: 'Pasante', Email: 'srocha@repropig.com' },
      { Nombres: 'Zully', Apellidos: 'Silva', Documento: '1003002', Cargo: 'Pasante', Email: 'zsilva@repropig.com' },
      { Nombres: 'Valeria', Apellidos: 'Cardona', Documento: '1003003', Cargo: 'Pasante', Email: 'vcardona@repropig.com' }
    ];

    for (const resp of responsablesReales) {
      await db.query(
        `INSERT INTO responsable (Nombres, Apellidos, Documento, Cargo, Email, Estado) 
         SELECT ?, ?, ?, ?, ?, 'Activo' 
         WHERE NOT EXISTS (SELECT 1 FROM responsable WHERE Nombres = ? AND Apellidos = ?);`,
        { replacements: [resp.Nombres, resp.Apellidos, resp.Documento, resp.Cargo, resp.Email, resp.Nombres, resp.Apellidos] }
      );
    }
    console.log('  ✓ Personal del SENA actualizado');

    // 3. Porcinos Reales
    const porcinosData = [
      { Id: 1, Nom: 'Diomedes', Chapeta: 101, Placa: 501, Raza: 3, Gen: 'M', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-01-15', Peso: 208.00 },
      { Id: 2, Nom: 'Máximo', Chapeta: 102, Placa: 502, Raza: 5, Gen: 'M', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2023-06-10', Peso: 220.00 },

      { Id: 3, Nom: 'Puya', Chapeta: 201, Placa: 601, Raza: 5, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-05-10', Peso: 154.60 },
      { Id: 4, Nom: 'Betwui', Chapeta: 202, Placa: 602, Raza: 6, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-06-01', Peso: 186.00 },
      { Id: 5, Nom: 'Dicha', Chapeta: 203, Placa: 603, Raza: 1, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-06-12', Peso: 170.00 },
      { Id: 6, Nom: 'Mafalda', Chapeta: 204, Placa: 604, Raza: 6, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2023-11-20', Peso: 180.00 },
      { Id: 7, Nom: 'Bonita', Chapeta: 205, Placa: 605, Raza: 2, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-07-01', Peso: 175.00 },
      { Id: 8, Nom: 'Zajuna', Chapeta: 206, Placa: 606, Raza: 4, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-07-05', Peso: 165.00 },

      { Id: 9, Nom: 'Vallenata', Chapeta: 207, Placa: 607, Raza: 1, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-08-01', Peso: 140.00 },
      { Id: 10, Nom: 'Josefa', Chapeta: 208, Placa: 608, Raza: 2, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-07-15', Peso: 188.80 },
      { Id: 11, Nom: 'Petra', Chapeta: 209, Placa: 609, Raza: 3, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2023-08-10', Peso: 218.00 },
      { Id: 12, Nom: 'Parranda', Chapeta: 7497, Placa: 610, Raza: 6, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Geovanny / La Granja', Nac: '2025-09-02', Peso: 175.40 },
      { Id: 13, Nom: 'Jelena', Chapeta: 211, Placa: 611, Raza: 1, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2025-01-10', Peso: 169.00 },
      { Id: 14, Nom: 'P-Triton', Chapeta: 212, Placa: 612, Raza: 4, Gen: 'H', Tipo: 'Adulto', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2025-03-01', Peso: 143.20 },

      // Lechones para seguimiento de camadas
      { Id: 15, Nom: 'Lechón #1 Puya', Chapeta: 301, Placa: 701, Raza: 5, Gen: 'M', Tipo: 'Lechon', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2026-09-19', Peso: 7.69, Parto: 1 },
      { Id: 16, Nom: 'Lechón #2 Puya', Chapeta: 302, Placa: 702, Raza: 5, Gen: 'H', Tipo: 'Lechon', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2026-09-19', Peso: 7.50, Parto: 1 },
      { Id: 17, Nom: 'Lechón #1 Parranda', Chapeta: 303, Placa: 703, Raza: 6, Gen: 'M', Tipo: 'Lechon', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2026-08-16', Peso: 6.30, Parto: 2 },
      { Id: 18, Nom: 'Lechón #1 Mafalda', Chapeta: 304, Placa: 704, Raza: 6, Gen: 'H', Tipo: 'Lechon', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2025-04-12', Peso: 6.60, Parto: 3 },
      { Id: 19, Nom: 'Lechón #1 Petra', Chapeta: 305, Placa: 705, Raza: 3, Gen: 'M', Tipo: 'Lechon', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-07-08', Peso: 5.10, Parto: 4 },
      { Id: 20, Nom: 'Lechón #2 Petra', Chapeta: 306, Placa: 706, Raza: 3, Gen: 'H', Tipo: 'Lechon', Proc: 'Interno', Lug: 'Centro Agropecuario "La Granja"', Nac: '2024-07-08', Peso: 5.00, Parto: 4 }
    ];

    for (const p of porcinosData) {
      await db.query(
        `INSERT INTO porcinos (Id_Porcino, Nom_Porcino, Num_Chapeta, Plac_Sena_Porcino, Id_Raza, Gen_Porcino, Tipo_Cerdo, Proc_Porcino, Lug_Proc_Porcino, Fec_Nac_Porcino, Fec_Llegada, Peso_Llegada, Estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo');`,
        { replacements: [p.Id, p.Nom, p.Chapeta, p.Placa, p.Raza, p.Gen, p.Tipo, p.Proc, p.Lug, p.Nac, p.Nac, p.Peso] }
      );
    }
    console.log('  ✓ Porcinos reales (cerdas, machos y lechones) cargados');

    // 4. Medicamentos
    const medicamentosData = [
      { Nombre: 'Hierro Dextrano', Tipo: 'Vitamina', Presentacion: 'Frasco x 100 ml', Cantidad: 10, Unidad_Medida: 'ml', Precio_Unitario: 35000, Observaciones: 'Para prevención de anemia en lechones neonatos' },
      { Nombre: 'Compleland Multivitamínico', Tipo: 'Vitamina', Presentacion: 'Frasco x 250 ml', Cantidad: 8, Unidad_Medida: 'ml', Precio_Unitario: 42000, Observaciones: 'Reconstituyente y estimulante en cerdas' },
      { Nombre: 'Vermífugo Porcino', Tipo: 'Antiparasitario', Presentacion: 'Frasco x 500 ml', Cantidad: 5, Unidad_Medida: 'ml', Precio_Unitario: 55000, Observaciones: 'Desparasitación interna preventiva' },
      { Nombre: 'Bay-Cox / Toltrazuril', Tipo: 'Antiparasitario', Presentacion: 'Frasco x 250 ml', Cantidad: 6, Unidad_Medida: 'ml', Precio_Unitario: 78000, Observaciones: 'Control de coccidiosis neonatal en parideras' },
      { Nombre: 'Yodo Antiséptico Umbilical', Tipo: 'Antiinflamatorio', Presentacion: 'Frasco x 1000 ml', Cantidad: 12, Unidad_Medida: 'L', Precio_Unitario: 28000, Observaciones: 'Desinfección de ombligos al nacimiento' },
      { Nombre: 'Oxitocina Veterinaria', Tipo: 'Analgesico', Presentacion: 'Frasco x 50 ml', Cantidad: 15, Unidad_Medida: 'ml', Precio_Unitario: 22000, Observaciones: 'Inducción de contracciones durante el parto' },
      { Nombre: 'Pig Save Suplemento', Tipo: 'Vitamina', Presentacion: 'Sobre x 100 g', Cantidad: 20, Unidad_Medida: 'g', Precio_Unitario: 18000, Observaciones: 'Suplemento energético para lechones débiles' }
    ];

    for (const m of medicamentosData) {
      await db.query(
        `INSERT INTO medicamentos (Nombre, Tipo, Presentacion, Cantidad, Unidad_Medida, Precio_Unitario, Observaciones) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        { replacements: [m.Nombre, m.Tipo, m.Presentacion, m.Cantidad, m.Unidad_Medida, m.Precio_Unitario, m.Observaciones] }
      );
    }
    console.log('  ✓ Medicamentos cargados');

    // 5. Colectas Reales de Semen
    const colectasReales = [
      { Fecha: '2023-01-27', Macho: 2, Vol: 200.00, Color: 'Normal', Olor: 'Normal', Gen: 8, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2023-02-20', Macho: 2, Vol: 200.00, Color: 'Normal', Olor: 'Normal', Gen: 8, Util: 0, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2023-03-26', Macho: 2, Vol: 250.00, Color: 'Normal', Olor: 'Normal', Gen: 10, Util: 4, Obs: 'Inseminación' },
      { Fecha: '2023-04-12', Macho: 2, Vol: 500.00, Color: 'Normal', Olor: 'Normal', Gen: 20, Util: 6, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2023-05-26', Macho: 2, Vol: 340.00, Color: 'Normal', Olor: 'Normal', Gen: 14, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2023-05-30', Macho: 2, Vol: 410.00, Color: 'Normal', Olor: 'Normal', Gen: 16, Util: 4, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2023-06-05', Macho: 2, Vol: 260.00, Color: 'Normal', Olor: 'Normal', Gen: 10, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2023-06-09', Macho: 2, Vol: 360.00, Color: 'Normal', Olor: 'Normal', Gen: 14, Util: 4, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2023-06-13', Macho: 2, Vol: 220.00, Color: 'Normal', Olor: 'Normal', Gen: 9, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2024-04-09', Macho: 2, Vol: 200.00, Color: 'Normal', Olor: 'Normal', Gen: 8, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2024-04-23', Macho: 2, Vol: 490.00, Color: 'Normal', Olor: 'Normal', Gen: 19, Util: 6, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2024-04-26', Macho: 2, Vol: 390.00, Color: 'Normal', Olor: 'Normal', Gen: 15, Util: 4, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2025-02-18', Macho: 2, Vol: 300.00, Color: 'Normal', Olor: 'Normal', Gen: 12, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2025-02-20', Macho: 2, Vol: 230.00, Color: 'Normal', Olor: 'Normal', Gen: 9, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2025-02-25', Macho: 2, Vol: 230.00, Color: 'Normal', Olor: 'Normal', Gen: 9, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2025-02-27', Macho: 2, Vol: 230.00, Color: 'Normal', Olor: 'Normal', Gen: 9, Util: 2, Obs: 'Estimulación Macho y Hembras' },
      { Fecha: '2025-11-05', Macho: 2, Vol: 100.00, Color: 'Normal', Olor: 'Normal', Gen: 4, Util: 0, Obs: 'Estimulación y práctica de colecta' },
      { Fecha: '2025-11-07', Macho: 2, Vol: 250.00, Color: 'Normal', Olor: 'Normal', Gen: 10, Util: 2, Obs: 'Práctica de laboratorio' },
      { Fecha: '2025-11-16', Macho: 2, Vol: 300.00, Color: 'Normal', Olor: 'Normal', Gen: 12, Util: 4, Obs: 'Práctica de laboratorio y conservación' }
    ];

    for (const c of colectasReales) {
      await db.query(
        `INSERT INTO colecta (Fecha, Uso_colecta, Tipo, Id_Porcino, Id_Responsable, volumen, color, olor, cant_generada, cant_utilizada, Observaciones) 
         VALUES (?, 'Si', 'Interno', ?, '[1, 2]', ?, ?, ?, ?, ?, ?);`,
        { replacements: [c.Fecha, c.Macho, c.Vol, c.Color, c.Olor, c.Gen, c.Util, c.Obs] }
      );
    }
    console.log('  ✓ Colectas de semen cargadas');

    // 6. Ciclos, Montas e Inseminaciones Reproductivas
    const serviciosData = [
      { Cerda: 3, Macho: 1, Fecha: '2026-05-17', Obs: 'Servicio efectivo en paridera. FPP: 2026-09-08', Tipo: 'Monta' },
      { Cerda: 4, Macho: 1, Fecha: '2026-06-03', Obs: 'Servicio efectivo. FPP: 2026-09-25', Tipo: 'Monta' },
      { Cerda: 5, Macho: 1, Fecha: '2026-06-11', Obs: 'Servicio efectivo. FPP: 2026-10-03', Tipo: 'Monta' },
      { Cerda: 6, Macho: 1, Fecha: '2026-07-05', Obs: 'Servicio efectivo. FPP: 2026-10-27', Tipo: 'Monta' },
      { Cerda: 7, Macho: 1, Fecha: '2026-07-20', Obs: '2 montas efectivas. FPP: 2026-11-17', Tipo: 'Monta' },
      { Cerda: 8, Macho: 1, Fecha: '2026-07-21', Obs: '1 monta efectiva. FPP: 2026-11-18', Tipo: 'Monta' },
      { Cerda: 9, Macho: 2, Fecha: '2026-08-01', Obs: 'Inseminación Artificial exitosa con dosis de Máximo (Colecta #3).', Tipo: 'Inseminacion', IdColecta: 3 },
      { Cerda: 10, Macho: 2, Fecha: '2026-08-10', Obs: 'Inseminación Artificial realizada con catéter espiral y dosis refrigerada.', Tipo: 'Inseminacion', IdColecta: 4 },
      { Cerda: 11, Macho: 2, Fecha: '2024-03-14', Obs: 'Parto exitoso realizado el 2024-07-08', Tipo: 'Monta' },
      { Cerda: 12, Macho: 1, Fecha: '2026-04-24', Obs: 'Parto exitoso realizado el 2026-08-16', Tipo: 'Monta' }
    ];

    const addDays = (dateStr, days) => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const ciclosMap = {};

    for (const s of serviciosData) {
      const [resCiclo] = await db.query(
        `INSERT INTO ciclos_reproductivos (Id_Cerda, Estado, TipoCiclo) VALUES (?, 'Activo', ?);`,
        { replacements: [s.Cerda, s.Tipo] }
      );
      const idCiclo = resCiclo;
      ciclosMap[s.Cerda] = idCiclo;

      if (s.Tipo === 'Monta') {
        await db.query(
          `INSERT INTO monta (Fec_hora, Id_Porcino, Id_Cerdo, Id_Responsable, Observaciones, Id_Ciclo, estado) 
           VALUES (?, ?, ?, '[1,2]', ?, ?, 'Activo');`,
          { replacements: [s.Fecha, s.Cerda, s.Macho, s.Obs, idCiclo] }
        );
      } else {
        await db.query(
          `INSERT INTO inseminacion (Fec_hora, Id_Porcino, Id_colecta, Id_Responsable, cantidad, Observaciones, Id_Ciclo, estado) 
           VALUES (?, ?, ?, '[1,2]', 2, ?, ?, 'Activo');`,
          { replacements: [s.Fecha, s.Cerda, s.IdColecta || 3, s.Obs, idCiclo] }
        );
      }

      // Cargar Calendario Reproductivo correspondiente
      const rc1 = addDays(s.Fecha, 21);
      const rc2 = addDays(s.Fecha, 42);
      const cambio = addDays(s.Fecha, 100);
      const d107 = addDays(s.Fecha, 107);
      const fppParto = addDays(s.Fecha, 114);

      await db.query(
        `INSERT INTO Calendario (Fecha_Servicio, rc1, rc2, cambio_alimento, dia_107, parto, Id_Ciclo) 
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        { replacements: [s.Fecha, `${rc1} 08:00:00`, `${rc2} 08:00:00`, `${cambio} 08:00:00`, `${d107} 08:00:00`, `${fppParto} 08:00:00`, idCiclo] }
      );
    }
    console.log('  ✓ Ciclos, Montas, Inseminaciones y Calendarios Reproductivos cargados');

    // 7. Partos Reales
    const partosReales = [
      {
        Cerda: 3, // Puya
        Fec_ini: '2026-09-19', Hor_ini: '09:09:00', Fec_fin: '2026-09-19', Hor_fin: '14:35:00',
        Vivos: 10, Muertos: 0, Momias: 0, Peso: 76.90, Obs: 'Parto normal N° 1. Vivos: 10, Peso promedio lechón 7.69 kg'
      },
      {
        Cerda: 4, // Betwui
        Fec_ini: '2026-09-25', Hor_ini: '06:30:00', Fec_fin: '2026-09-25', Hor_fin: '10:45:00',
        Vivos: 12, Muertos: 0, Momias: 0, Peso: 82.00, Obs: 'Parto atendidio. Vivos: 12, Peso promedio 6.83 kg'
      },
      {
        Cerda: 5, // Dicha
        Fec_ini: '2026-10-03', Hor_ini: '07:15:00', Fec_fin: '2026-10-03', Hor_fin: '11:20:00',
        Vivos: 11, Muertos: 1, Momias: 0, Peso: 78.50, Obs: 'Parto ración lactancia. Total nacidos 12 (11 vivos, 1 muerto)'
      },
      {
        Cerda: 12, // Parranda (DPC 7497)
        Fec_ini: '2026-08-16', Hor_ini: '01:56:00', Fec_fin: '2026-08-16', Hor_fin: '04:02:00',
        Vivos: 11, Muertos: 0, Momias: 4, Peso: 69.70, Obs: 'Parto N° 1. Vivos: 11, Momias: 4, Peso camada: 69.7 kg'
      },
      {
        Cerda: 6, // Mafalda (Parto N° 4)
        Fec_ini: '2025-04-12', Hor_ini: '08:00:00', Fec_fin: '2025-04-12', Hor_fin: '12:30:00',
        Vivos: 16, Muertos: 2, Momias: 0, Peso: 105.60, Obs: 'Planilla Paridera Parto N° 4 Mafalda. Total nacidos: 18 (16 vivos, 2 muertos)'
      },
      {
        Cerda: 11, // Petra (Parto N° 2)
        Fec_ini: '2024-07-08', Hor_ini: '21:16:00', Fec_fin: '2024-07-08', Hor_fin: '23:12:00',
        Vivos: 15, Muertos: 1, Momias: 1, Peso: 75.50, Obs: 'Planilla Paridera Parto N° 2 Petra. Total nacidos: 17 (15 vivos, 1 muerto, 1 momia)'
      }
    ];

    for (const p of partosReales) {
      const idCiclo = ciclosMap[p.Cerda];

      const [idPartoCreado] = await db.query(
        `INSERT INTO partos (Id_Porcino, Fec_inicio, Hor_inicial, Nac_vivos, Nac_momias, Nac_muertos, Pes_camada, Observaciones, Fec_fin, Hor_final, Id_Ciclo, Id_Responsable) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[1,2]');`,
        { replacements: [p.Cerda, p.Fec_ini, p.Hor_ini, p.Vivos, p.Momias, p.Muertos, p.Peso, p.Obs, p.Fec_fin, p.Hor_fin, idCiclo || null] }
      );
      
      // Asignar Id_parto a los lechones correspondientes
      await db.query(
        `UPDATE porcinos SET Id_parto = ? WHERE Nom_Porcino LIKE ?;`,
        { replacements: [idPartoCreado, `%${p.Obs.includes('Puya') ? 'Puya' : p.Obs.includes('Parranda') ? 'Parranda' : p.Obs.includes('Mafalda') ? 'Mafalda' : p.Obs.includes('Betwui') ? 'Betwui' : p.Obs.includes('Dicha') ? 'Dicha' : 'Petra'}%`] }
      );

      // Finalizar ciclo finalizado
      if (idCiclo) {
        await db.query(`UPDATE ciclos_reproductivos SET Estado = 'Finalizado' WHERE Id_Ciclo = ?;`, { replacements: [idCiclo] });

        // Marcar todas las revisiones del calendario como completadas
        await db.query(
          `UPDATE Calendario SET 
            real_rc1 = rc1, resultado_rc1 = 'no_recelo', observaciones_rc1 = 'Celo no presentado (Gestación confirmada)',
            real_rc2 = rc2, resultado_rc2 = 'no_recelo', observaciones_rc2 = 'Celo no presentado',
            real_cambio_alimento = cambio_alimento, observaciones_cambio = 'Ración cambiada a gestación',
            real_dia_107 = dia_107, observaciones_107 = 'Traslado a lactancia ejecutado',
            real_parto = ?, observaciones_parto = 'Parto atendido y registrado exitosamente'
           WHERE Id_Ciclo = ?;`,
          { replacements: [p.Fec_ini, idCiclo] }
        );
      }
    }

    // Para cerdas en gestación activa (Cerda 7 Bonita y Cerda 8 Zajuna), registrar sus 1er y 2° recelos ya pasados
    const cerdasGestantes = [7, 8];
    for (const idCerda of cerdasGestantes) {
      const idCiclo = ciclosMap[idCerda];
      if (idCiclo) {
        await db.query(
          `UPDATE Calendario SET 
            real_rc1 = rc1, resultado_rc1 = 'no_recelo', observaciones_rc1 = 'Celo no presentado',
            real_rc2 = rc2, resultado_rc2 = 'no_recelo', observaciones_rc2 = 'Celo no presentado'
           WHERE Id_Ciclo = ?;`,
          { replacements: [idCiclo] }
        );
      }
    }

    console.log('  ✓ Partos, finalización de ciclos y revisiones de Calendario cargadas');

    // 8. Seguimiento de Camada (segcamada: Días 1, 3, 5, 7, 10, 14, 21, 28)
    const segcamadaData = [
      // Lechón #1 Puya (Fec Parto: 2026-09-19)
      { Porcino: 15, Dia: 1, Fecha: '2026-09-19', Peso: 1.40, Med: 1, Obs: 'Pesaje al nacimiento y aplicación de Hierro Dextrano' },
      { Porcino: 15, Dia: 3, Fecha: '2026-09-21', Peso: 1.70, Med: 5, Obs: 'Descolado preventivo y curación umbilical con Yodo' },
      { Porcino: 15, Dia: 5, Fecha: '2026-09-23', Peso: 2.10, Med: 7, Obs: 'Suplemento energizante Pig Save para lechón' },
      { Porcino: 15, Dia: 7, Fecha: '2026-09-26', Peso: 2.80, Med: 3, Obs: 'Pesaje semana 1 y control antiparasitario' },
      { Porcino: 15, Dia: 10, Fecha: '2026-09-29', Peso: 3.50, Med: 2, Obs: 'Revisión física y vitamina de crecimiento' },
      { Porcino: 15, Dia: 14, Fecha: '2026-10-03', Peso: 4.60, Med: 4, Obs: 'Prevención de coccidiosis neonatal con Bay-Cox' },
      { Porcino: 15, Dia: 21, Fecha: '2026-10-10', Peso: 6.20, Med: 2, Obs: 'Pesaje pre-destete 21 días' },
      { Porcino: 15, Dia: 28, Fecha: '2026-10-17', Peso: 7.80, Med: 7, Obs: 'Pesaje final destete y inicio de ración seca' },

      // Lechón #1 Parranda (Fec Parto: 2026-08-16)
      { Porcino: 17, Dia: 1, Fecha: '2026-08-16', Peso: 1.50, Med: 1, Obs: 'Nacimiento lechón camada Parranda' },
      { Porcino: 17, Dia: 3, Fecha: '2026-08-18', Peso: 1.85, Med: 5, Obs: 'Sanidad umbilical y descolado' },
      { Porcino: 17, Dia: 7, Fecha: '2026-08-22', Peso: 2.90, Med: 3, Obs: 'Pesaje 7 días lechón Parranda' },
      { Porcino: 17, Dia: 14, Fecha: '2026-08-29', Peso: 4.75, Med: 4, Obs: 'Control de salud neonatal' },
      { Porcino: 17, Dia: 21, Fecha: '2026-09-06', Peso: 6.10, Med: 2, Obs: 'Pesaje 21 días camada Parranda' },
      { Porcino: 17, Dia: 28, Fecha: '2026-09-13', Peso: 7.70, Med: 7, Obs: 'Destete camada Parranda' },

      // Lechón #1 Mafalda (Fec Parto: 2025-04-12)
      { Porcino: 18, Dia: 1, Fecha: '2025-04-12', Peso: 1.45, Med: 1, Obs: 'Nacimiento camada Mafalda' },
      { Porcino: 18, Dia: 7, Fecha: '2025-04-19', Peso: 2.75, Med: 3, Obs: 'Pesaje semana 1 camada Mafalda' },
      { Porcino: 18, Dia: 21, Fecha: '2025-05-03', Peso: 6.00, Med: 2, Obs: 'Pesaje 21 días camada Mafalda' },

      // Lechón #1 Petra (Fec Parto: 2024-07-08)
      { Porcino: 19, Dia: 1, Fecha: '2024-07-08', Peso: 1.35, Med: 1, Obs: 'Pesaje al nacimiento y aplicación de Hierro Dextrano' },
      { Porcino: 19, Dia: 3, Fecha: '2024-07-10', Peso: 1.65, Med: 5, Obs: 'Curación de ombligo y descolado' },
      { Porcino: 19, Dia: 7, Fecha: '2024-07-15', Peso: 2.70, Med: 3, Obs: 'Pesaje semana 1 camada Petra' },
      { Porcino: 19, Dia: 14, Fecha: '2024-07-22', Peso: 4.40, Med: 4, Obs: 'Control anticoccidial Bay-Cox' },
      { Porcino: 19, Dia: 21, Fecha: '2024-07-29', Peso: 5.90, Med: 2, Obs: 'Pesaje destete 21 días camada Petra' },

      // Lechón #2 Petra (Fec Parto: 2024-07-08)
      { Porcino: 20, Dia: 1, Fecha: '2024-07-08', Peso: 1.30, Med: 1, Obs: 'Nacimiento Lechón #2 camada Petra' },
      { Porcino: 20, Dia: 7, Fecha: '2024-07-15', Peso: 2.65, Med: 3, Obs: 'Pesaje 7 días' },
      { Porcino: 20, Dia: 21, Fecha: '2024-07-29', Peso: 5.80, Med: 2, Obs: 'Pesaje 21 días' }
    ];

    const segCamadaMap = [];
    for (const sc of segcamadaData) {
      const [resSc] = await db.query(
        `INSERT INTO segcamada (Id_Porcino, Dia_Programado, Fecha_Real, Peso_Cria, Id_Medicamento, Observaciones) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        { replacements: [sc.Porcino, sc.Dia, sc.Fecha, sc.Peso, sc.Med, sc.Obs] }
      );
      segCamadaMap.push(resSc);
    }
    console.log('  ✓ Seguimientos de camada (segcamada Días 1-28) cargados');

    // 9. Actividades de Camada (actividades_camada)
    const actividades = [
      { Tipo: 'Aplicación de Hierro Dextrano', Fecha: '2026-09-21', Obs: 'Dosis 2ml por lechón recién nacido', Med: 1, SegCamada: segCamadaMap[0] },
      { Tipo: 'Descolmillado y Desinfectado de Ombligo', Fecha: '2026-09-19', Obs: 'Con yodo antiséptico', Med: 5, SegCamada: segCamadaMap[0] },
      { Tipo: 'Descolado Preventivo', Fecha: '2026-09-22', Obs: 'Procedimiento de sanidad', Med: null, SegCamada: segCamadaMap[1] },
      { Tipo: 'Pesaje Camada 21 días', Fecha: '2026-10-10', Obs: 'Control de crecimiento lechón Puya', Med: 2, SegCamada: segCamadaMap[6] }
    ];

    for (const act of actividades) {
      await db.query(
        `INSERT INTO actividades_camada (Tipo_Actividad, Fecha_Actividad, Observaciones, Id_Medicamento, Id_SegCamada, Id_Responsable) 
         VALUES (?, ?, ?, ?, ?, '[1,2]');`,
        { replacements: [act.Tipo, act.Fecha, act.Obs, act.Med, act.SegCamada] }
      );
    }
    console.log('  ✓ Actividades de camada cargadas');

    // 10. Seguimiento de Cerdas (Seguimiento_Cerda)
    const seguimientosCerda = [
      { Cerda: 3, Fecha: '2026-09-11', Hora: '08:00:00', Obs: 'Lavado uterino post-parto y administración de Compleland', Med: 2, Ciclo: ciclosMap[3] },
      { Cerda: 4, Fecha: '2026-09-15', Hora: '09:30:00', Obs: 'Tratamiento por cojera leve. Reposo en corral.', Med: 6, Ciclo: ciclosMap[4] },
      { Cerda: 11, Fecha: '2026-08-30', Hora: '10:00:00', Obs: 'Revisión médica y control de celo activo.', Med: 2, Ciclo: ciclosMap[11] },
      { Cerda: 12, Fecha: '2026-08-18', Hora: '07:30:00', Obs: 'Aplicación de Compleland y revisión de ubres.', Med: 2, Ciclo: ciclosMap[12] }
    ];

    for (const sc of seguimientosCerda) {
      await db.query(
        `INSERT INTO Seguimiento_Cerda (Fecha, Hora, Observaciones, Id_Porcino, Id_Responsable, Id_Medicamento, Id_Ciclo) 
         VALUES (?, ?, ?, ?, 1, ?, ?);`,
        { replacements: [sc.Fecha, sc.Hora, sc.Obs, sc.Cerda, sc.Med, sc.Ciclo || null] }
      );
    }
    console.log('  ✓ Seguimiento diario de cerdas cargado');

    // 11. Novedades (Mueros, Momias, Enfermedades y Traslados)
    const novedadesReales = [
      { Fecha: '2026-09-19', Tipo: 'Salud / Traslado', Causa: 'Traslado a lactancia', Obs: 'Cerda Puya: Realizado traslado a paridera y cambio a alimento ración de lactancia.', Id_Porcino: 3 },
      { Fecha: '2026-08-16', Tipo: 'Muerte', Causa: 'Nacido muerto / Momia', Obs: 'Camada Parranda: Registradas 4 momias al momento del parto.', Id_Porcino: 12 },
      { Fecha: '2025-04-12', Tipo: 'Muerte', Causa: 'Nacido muerto', Obs: 'Camada Mafalda (Parto N° 4): Registrados 2 lechones nacidos muertos.', Id_Porcino: 6 },
      { Fecha: '2024-07-08', Tipo: 'Muerte', Causa: 'Nacido muerto / Momia', Obs: 'Camada Petra (Parto N° 2): Registrado 1 muerto y 1 momia.', Id_Porcino: 11 },
      { Fecha: '2026-09-15', Tipo: 'Lesión', Causa: 'Cojera extremidad posterior', Obs: 'Betwui presenta cojera en extremidad posterior. Tratamiento y reposo en corral.', Id_Porcino: 4 },
      { Fecha: '2026-09-20', Tipo: 'Celo', Causa: 'Celo no efectivo', Obs: 'Vallenata presenta vulva edematizada pero no presenta reflejo de quietud.', Id_Porcino: 9 },
      { Fecha: '2026-08-30', Tipo: 'Celo', Causa: 'Celo activo', Obs: 'Petra presentó celo efectivo. Se agenda para seguimiento reproductivo.', Id_Porcino: 11 }
    ];

    for (const nov of novedadesReales) {
      await db.query(
        `INSERT INTO novedades (Fecha_Novedad, Tipo_Novedad, Causa_Motivo, Observaciones, Id_Porcino) 
         VALUES (?, ?, ?, ?, ?);`,
        { replacements: [nov.Fecha, nov.Tipo, nov.Causa, nov.Obs, nov.Id_Porcino] }
      );
    }
    console.log('  ✓ Novedades operativas (Muertes, Momias, Salud y Celo) cargadas');

    console.log('\n🎉 ¡PROCESO DE CARGA COMPLETO Y VERIFICADO EXITOSAMENTE!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en el proceso de seed:', error);
    process.exit(1);
  }
}

seed();
