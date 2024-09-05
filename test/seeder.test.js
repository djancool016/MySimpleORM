const config = require('../config')
const {poolManager, runSeeds, runTruncator} = require('../src').init(config)

const seeder = [
    {
        table: 'roles',
        seed: [
            {
                id: 1,
                name: "Admin",
                description: "Full access to system features."
            },
            {
                id: 2,
                name: "Manager",
                description: "Supervise loan operations."
            }
        ]
    },
    {
        table: 'users',
        seed: [
            {
                id: 1,
                role_id: 1,
                username: 'admin',
                password: '$2b$10$h6Uo0u07tzgVf14jTsIPHOskqDUdDwLsZeMFCxX5rm8BsEJTePZd.',
                email: 'admin@Email.com',
                name: 'Dwi Julianto',
                phone: '213546879213',
                address: 'Semarang, Indonesia',
                nik: '7722323656989'
            }
        ]
    }
]

describe('Test Seeder', () => {

    let pool

    beforeAll(async() => {   
        pool = poolManager.connect()
    })

    test('Start test seeds', async() => {
        await runTruncator(pool)
        await runSeeds(seeder, pool)

        const result = await pool.query(`SELECT * FROM ${seeder[0].table}`) 
        expect(result).toBeTruthy()
    })

    afterAll(async()=>{
        await pool.end()
    })
})
