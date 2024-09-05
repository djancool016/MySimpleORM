const config = require('../config')
const {poolManager, runSeeds, runTruncator, runMigrations} = require('../src').init(config)
const {migrations, seeds} = require('./dataSamples')

describe('Test seeds', () => {

    let pool

    beforeAll(async() => {   
        pool = poolManager.connect()
    })

    test('Start test seeds', async() => {
        await runMigrations(migrations, pool)
        await runTruncator(pool)
        await runSeeds(seeds, pool)

        const result = await pool.query(`SELECT * FROM ${seeds[0].table}`) 
        expect(result).toBeTruthy()
    })

    afterAll(async()=>{
        await pool.end()
    })
})
