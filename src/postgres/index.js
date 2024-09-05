module.exports = {
    init: (config) => {

        const { runMigrations } = require('./migration')
        const { runSeed, runSeeds } = require('./seeder')
        const query = require('./query').init(config)
        const db = require('./db')
        const {runTruncator, getAllTables} = require('./truncator').init(config)

        const migrations = async (migrations, pool) => {
            const existingTables = await getAllTables(pool)
            const migrationsToRun = migrations.filter(migration => !existingTables.includes(migration.tableName))
            if (migrationsToRun.length > 0) {
                await runMigrations(migrationsToRun, pool)
            } else {
                console.log('All tables already migrated.')
            }
        }

        return {
            db,
            query,
            getAllTables,
            runMigrations: migrations,
            runSeed,
            runSeeds,
            runTruncator
        }
    }
}