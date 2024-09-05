
module.exports = {
    init: (config) => {

        const {runMigrations, runSeed, runSeeds, runTruncator, getAllTables} = require(`./postgres`).init(config)
        const {databaseManager, poolManager} = require('./database').init(config)
        const Model = require('./model')
        const builder = require('./utils/queryBuilder').init(config)
        const UnitTestFramework = require('./utils/unitTestFramework')
        const ApiTestFramework = require('./utils/api.test.framework')
        const controller = require('./controller')
        const customError = require('./utils/customError')
        const httpLogger = require('./utils/httpLogger')
        const modelMapper = require('./utils/modelMapper')

        return {
            databaseManager,
            poolManager,
            runMigrations,
            runSeed,
            runSeeds,
            runTruncator,
            getAllTables,
            builder,
            Model,
            controller,
            UnitTestFramework,
            ApiTestFramework,
            customError,
            httpLogger,
            modelMapper
        }
    }
}