
module.exports = {
    init: (config) => {

        const {runMigration, runMigrations, runSeed, runSeeds, runTruncator} = require(`./postgres`)
        const {databaseManager, poolManager} = require('./database').init(config)
        const Model = require('./model')
        const builder = require('./utils/queryBuilder').init(config)
        const unitTestFramework = require('./utils/unitTestFramework')

        return {
            databaseManager,
            poolManager,
            runMigration,
            runMigrations,
            runSeed,
            runSeeds,
            runTruncator,
            builder,
            Model,
            unitTestFramework
        }
    }
}