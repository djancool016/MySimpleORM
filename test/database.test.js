const config = require('../config')
const {databaseManager, poolManager} = require('../src/database').init(config)

describe('Testing database connections', () => {
    let pool
    let db
    beforeAll(async() => {   
        db = await databaseManager.connect()
        pool = poolManager.connect()
    })
    
    test('Test if database and pool connection present', async () => {
        expect(pool).toBeTruthy()
        expect(db).toBeTruthy
    })
    test('Test pool connection', async () => {
        const result = await pool.query('SELECT 1')
        expect(result).toBeTruthy()
    })
    test('Test database connection', async ()=> {
        const result = await db.query('SELECT 1')
        expect(result).toBeTruthy()
    })
    afterAll(async()=>{
        await pool.end()
        await db.end()
    })
})

