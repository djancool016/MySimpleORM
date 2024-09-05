const config = require('../config')
const {poolManager, runMigrations, getAllTables} = require('../src').init(config)
const {migrations} = require('./dataSamples')

describe('Test Migration', () => {

    let pool

    beforeAll(async() => {   
        pool = poolManager.connect()
    })

    test('Start test migration', async() => {

        await runMigrations(migrations, pool)

        const tables = await getAllTables(pool)  

        expect(tables).toBeTruthy()
    })

    afterAll(async()=>{
        await pool.end()
    })
})