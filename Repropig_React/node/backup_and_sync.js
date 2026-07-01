import fs from 'fs'
import path from 'path'
import dbModule from './database/db.js'

const db = dbModule.default || dbModule

const modelPaths = [
  './models/actividadesCamadaModel.js',
  './models/CalendarioModel.js',
  './models/colectaModel.js',
  './models/criaModel.js',
  './models/ciclosModel.js',
  './models/inseminacionModel.js',
  './models/MedicamentosModel.js',
  './models/montaModel.js',
  './models/novedadesModel.js',
  './models/PartosModel.js',
  './models/porcinoModel.js',
  './models/razaModel.js',
  './models/responsablesModel.js',
  './models/segcamadaModel.js',
  './models/Seguimiento_CerdaModel.js',
]

;(async () => {
  try {
    await db.authenticate()
    console.log('DB connection OK')
  } catch (e) {
    console.error('DB auth error', e.message)
    process.exit(1)
  }

  if (!fs.existsSync('backups')) fs.mkdirSync('backups')

  const legacy = ['reproduccion', 'ciclos_reproductivos', 'ciclo']
  for (const t of legacy) {
    try {
      const [rows] = await db.query(`SELECT * FROM \`${t}\``)
      fs.writeFileSync(path.join('backups', `${t}.json`), JSON.stringify(rows, null, 2))
      console.log('Backed up', t, 'rows', rows.length)
    } catch (err) {
      console.warn('Could not backup', t, err.message)
    }
  }

  for (const p of modelPaths) {
    try {
      const mod = await import(p)
      const m = mod.default || mod
      const name = m.getTableName ? m.getTableName() : m.name
      console.log('Syncing', name)
      await m.sync()
      console.log('Synced', name)
    } catch (err) {
      console.warn('Could not sync model', p, err.message)
    }
  }

  const [after] = await db.query('SHOW TABLES')
  console.log('Tables now:\n', after.map((r) => Object.values(r)[0]).join('\n'))
  console.log('Backup and sync complete')
  process.exit(0)
})()
