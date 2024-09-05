const config = require('../config')
const {poolManager, runTruncator, runSeeds} = require('../src').init(config)

const seeds = [
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


