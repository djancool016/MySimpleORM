module.exports = {
    init: (config) => {

        const { runMigrations } = require('./migration')
        const { runSeed, runSeeds } = require('./seeder')
        const query = require('./query').init(config)
        const db = require('./db')
        const {runTruncator, getAllTables} = require('./truncator').init(config)

        return {
            db,
            query,
            getAllTables,
            runMigrations,
            runSeed,
            runSeeds,
            runTruncator
        }
    }
}