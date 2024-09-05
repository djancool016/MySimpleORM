module.exports = {
    init: (config) => {

        const { runMigration, runMigrations } = require('./migration').init(config)
        const { runSeed, runSeeds } = require('./seeder').init(config)
        const query = require('./query').init(config)
        const db = require('./db')
        const {runTruncator, getAllTables} = require('./truncator').init(config)

        return {
            db,
            query,
            getAllTables,
            runMigration,
            runMigrations,
            runSeed,
            runSeeds,
            runTruncator
        }
    }
}