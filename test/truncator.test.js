const Database = require('../src/database')
const truncator = require('../src/truncator')
const config = require('../config')

describe('Testing database truncator', () => {

    let database
    const tbl = ["users", "roles"]

    beforeAll(async() => {
        const {db, pool} = Database.init(config)
        database = await db.connect()
    })

    test('Test truncator function', async () => {
        await truncator(database, tbl, config.db_system)

        if(config.db_system === 'postgres'){
            const result = await database.query(`SELECT * FROM ${tbl[0]}`)
            expect(result.rows.length).toBe(0)
        }else if(config.db_system === 'mysql'){
            const result = await database.query(`SELECT * FROM ${tbl[0]}`)
            expect(result.length).toBe(0)
        }
    })

    afterAll(async() => {
        database.end()
    })
})

