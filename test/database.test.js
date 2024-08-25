const {database} = require('../src/index')
const config = require('../config')

describe('Testing database connections', () => {

    let connectedDB
    let connectedPool
    const {db, pool} = database.init(config)

    beforeAll(async() => {   
        connectedDB = await db.connect()
        connectedPool = pool.createPool()
    })
    
    test('test database instance', async() => {
        expect(await connectedDB.query('SELECT 1')).toBeTruthy()
    })
    
    test('test pool instance', async() => {
        expect(await connectedPool.query('SELECT 1')).toBeTruthy()
    })
    
    afterAll(async() => {
        await db.end()
        await pool.end()
    })
})

