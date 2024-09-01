const { runMigration, runMigrations } = require('./migration')
const { runSeed, runSeeds } = require('./seeder')

module.exports = {
    db: require('./db'),
    query: require('./query'),
    runMigration,
    runMigrations,
    runSeed,
    runSeeds,
    runTruncator: require('./truncator').runTruncator
}