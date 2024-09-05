const config = require('../config')
const {poolManager, runTruncator, runSeeds, runMigrations} = require('../src').init(config)
const {seeds} = require('./dataSamples')

describe('Testing database truncator', () => {

    let pool

    beforeAll(async() => {
        pool = poolManager.connect()
        await runTruncator(pool)
        await runSeeds(seeds, pool)

    })

    test('Test truncator for filled tables', async () => {
        const result = await runTruncator(pool)
        expect(result).toBe(true)
    })

    test('Test truncator for empty tables', async () => {
        const result = await runTruncator(pool)
        expect(result).toBe(false)
    })

    afterAll(async() => {
        pool.end()
    })
})


