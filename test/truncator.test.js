const {truncator} = require('../src/dbmsBuilder/postgresBuilder')
const Database = require('../src/database')
const config = require('../config')

describe('Testing database truncator', () => {

    let database
    let pool
    const tbl = ["users", "roles"]

    beforeAll(async() => {
        const {db, pool: p} = Database.init(config)
        database = await db.connect()
        pool = p.createPool()
    })

    test('Test truncator function', async () => {
        await truncator(pool, tbl)
    })

    afterAll(async() => {
        database.end()
        pool.end()
    })
})


