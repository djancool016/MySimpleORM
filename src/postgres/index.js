module.exports = {
    init: (config) => {

        const { runMigrations } = require('./migration')
        const { runSeeds } = require('./seeder')
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

        const seeding = (seeds = [], pool) => runSeeds(seeds, pool, config.logging)

        return {
            db,
            query,
            getAllTables,
            runMigrations: migrations,
            runSeeds: seeding,
            runTruncator
        }
    }
}